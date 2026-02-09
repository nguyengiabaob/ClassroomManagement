import { Request, Response } from "express";
import { authServices } from "../services";
import { db } from "../firebase";
import crypto from "crypto";
import bcrypt from "bcrypt";
import { signAccessToken, signRefreshToken } from "../utils/jwtAuth";
import { refreshToken } from "firebase-admin/app";
import { sendSetupPasswordEmail } from "../services/email.service";
type UserType = "instructor" | "student";
interface AccessCodeDoc {
  code: number;
  expiresAt: number;
}

export interface LoginData {
  token: string;
  uid: string;
  email: string | null;
}

export class authController {
  static createAccesscode = async (req: Request, res: Response) => {
    const { phoneNumber } = req.body;
    try {
      if (!phoneNumber) {
        return res.status(400).json({ error: "Phone number is required " });
      }

      let code = authServices.generateVerifycationCode();
      await authServices.CreateAccessCode(phoneNumber, code);
      return res.status(200).json({
        message: "Access code is sent",
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to create access code" });
    }
  };
  static validateAccessCode = async (req: Request, res: Response) => {
    const { phoneNumber, accessCode } = req.body;
    if (!phoneNumber || !accessCode) {
      return res.status(400).json({
        error: "phoneNumber and accessCode are required",
      });
    }
    try {
      const phonenumberSaved = db.collection("accessCodes").doc(phoneNumber);
      const snapPhoneNumber = await phonenumberSaved.get();
      if (!snapPhoneNumber.exists) {
        return res.status(401).json({ error: "Invalid or expired code" });
      }
      const { code, expiresAt } = snapPhoneNumber.data() as AccessCodeDoc;
      console.log("snapPhoneNumber", snapPhoneNumber);

      if (Date.now() > expiresAt) {
        await phonenumberSaved.delete();
        return res.status(401).json({ error: "Code expired" });
      }

      if (Number(code).toString() !== accessCode) {
        return res.status(401).json({ error: "Invalid code" });
      }
      await phonenumberSaved.delete();

      const userSnap = await db.collection("users").doc(phoneNumber).get();

      const userType: UserType = userSnap.exists
        ? ((userSnap.data()?.type as UserType) ?? "student")
        : "student";

      const token = signAccessToken({
        phone: phoneNumber,
      });

      const refreshoken = signRefreshToken({
        phone: phoneNumber,
      });

      return res.status(200).json({
        authenticated: true,
        name: userSnap.data()?.name ?? "I",
        role: userType,
        accessToken: token,
        refreshToken: refreshoken,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        error: "Failed to validate access code",
      });
    }
  };

  loginWithUsernameAndPassword = async (req: Request, res: Response) => {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: "Wrong username or password" });
    }

    const snap = await db
      .collection("users")
      .where("username", "==", username)
      .limit(1)
      .get();

    if (snap.empty) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const user = snap.docs[0].data();

    const isMatchPassword = await bcrypt.compare(password, user.passwordHash);

    if (!isMatchPassword) {
      return res.status(401).json({ message: "Password is wrong" });
    }

    const token = signAccessToken({
      email: username,
    });

    const refreshToken = signRefreshToken({
      email: username,
    });

    return res.json({
      accessToken: token,
      refreshToken: refreshToken,
      role: user.role,
      name: user.name,
      authenticated: true,
    });
  };

  static registerUser = async (req: Request, res: Response) => {
    const { fullName, email, phone } = req.body;

    if (!fullName || !email || !phone) {
      return res.status(400).json({ message: "Missing fields" });
    }

    const existedUser = await db
      .collection("users")
      .where("email", "==", email)
      .limit(1)
      .get();
    console.log("dsadsad", existedUser);

    if (!existedUser.empty) {
      return res.status(409).json({ message: "Email already exists" });
    }
    const setupToken = crypto.randomBytes(16).toString("hex");
    const expiresAt = Date.now() + 24 * 60 * 60 * 1000;

    await db.collection("users").add({
      fullName,
      email,
      phone,
      isActive: false,
      setupToken,
      setupTokenExpires: expiresAt,
      createdAt: Date.now(),
      role: "student",
    });
    await sendSetupPasswordEmail(email, setupToken);
    return res.json({
      message: "Check your email to set up password",
    });
  };

  static setupPassword = async (req: Request, res: Response) => {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ message: "Missing data" });
    }

    const snap = await db
      .collection("users")
      .where("setupToken", "==", token)
      .limit(1)
      .get();

    if (snap.empty) {
      return res.status(400).json({ message: "Invalid token" });
    }

    const doc = snap.docs[0];
    const user = doc.data();

    if (Date.now() > user.setupTokenExpires) {
      return res.status(400).json({ message: "Token expired" });
    }

    const passwordHash = await bcrypt.hash(password, 8);

    await doc.ref.update({
      passwordHash,
      isActive: true,
      setupToken: null,
      setupTokenExpires: null,
    });

    return res.json({ message: "Password set successfully" });
  };
}
