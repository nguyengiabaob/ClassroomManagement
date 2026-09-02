import { Injectable, NotFoundException, Res } from "@nestjs/common";
import { PrismaService } from "../../shared/Database/prisma.service";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import { Request, Response } from "express";

import * as Crypto from "crypto";
import { sendSetupPasswordEmail } from "./email.service";
import { stat } from "fs";
import { OAuth2Client } from "google-auth-library";

@Injectable()
export class authServices {
  private readonly googleClient = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
  );

  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}
  static generateVerifycationCode = () => {
    return Math.floor(100000 + Math.random() * 900000);
  };

  async login(email: string, password: string, req: Request, res: Response) {
    const user = await this.prisma.user.findFirst({ where: { email } });

    if (!user) {
      return res.status(400).json({
        message: "User not found",
      });
    }
    if (!user.isActive)
      throw new Error("User is not active. Please set up your password.");
    let passwordHash = (await bcrypt.hash(password, 10)).toString();

    const match = await bcrypt.compare(password, user.password ?? "");
    if (match === false) {
      return res.status(400).json({
        message: "Wrong password",
      });
    }

    const tokens = this.generateTokens(user);

    await this.prisma.session.create({
      data: {
        userId: user.id,
        refreshToken: tokens.refreshToken,
        userAgent: req.headers["user-agent"],
        ip: req.ip,
        expiredAt: new Date(Date.now() + 7 * 86400000),
      },
    });
    return res.status(200).json({
      accessToken: tokens.accessToken,
    });
  }

  async loginWithGoogle(
    credential: string | undefined,
    req: Request,
    res: Response,
  ) {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    if (!clientId) {
      return res.status(503).json({ message: "Google login is not configured" });
    }
    if (!credential) {
      return res.status(400).json({ message: "Google credential is required" });
    }

    try {
      const ticket = await this.googleClient.verifyIdToken({
        idToken: credential,
        audience: clientId,
      });
      const profile = ticket.getPayload();

      if (!profile?.sub || !profile.email || !profile.email_verified) {
        return res.status(401).json({ message: "Invalid Google account" });
      }

      let user = await this.prisma.user.findFirst({
        where: {
          OR: [{ ssoId: profile.sub }, { email: profile.email }],
        },
      });

      if (user) {
        user = await this.prisma.user.update({
          where: { id: user.id },
          data: {
            ssoId: profile.sub,
            isActive: true,
            name: profile.name || user.name,
          },
        });
      } else {
        user = await this.prisma.user.create({
          data: {
            ssoId: profile.sub,
            email: profile.email,
            name: profile.name || profile.email,
            isActive: true,
          },
        });
      }

      const tokens = this.generateTokens(user);
      await this.prisma.session.create({
        data: {
          userId: user.id,
          refreshToken: tokens.refreshToken,
          userAgent: req.headers["user-agent"],
          ip: req.ip,
          expiredAt: new Date(Date.now() + 7 * 86400000),
        },
      });

      return res.status(200).json({
        authenticated: true,
        ...tokens,
        user: { id: user.id, name: user.name, email: user.email },
      });
    } catch {
      return res.status(401).json({ message: "Google authentication failed" });
    }
  }

  generateTokens(user: any) {
    const payload = { sub: user.id, email: user.email };

    const accessToken = this.jwt.sign(payload, {
      expiresIn: "15m",
    });

    const refreshToken = this.jwt.sign(payload, {
      expiresIn: "7d",
    });

    return { accessToken, refreshToken };
  }

  async refresh(refreshToken: string) {
    const session = await this.prisma.session.findFirst({
      where: { refreshToken },
    });

    if (!session) throw new Error("Invalid token");

    const payload = this.jwt.verify(refreshToken);

    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
    });

    return this.generateTokens(user);
  }

  async logout(refreshToken?: string) {
    if (!refreshToken) return;

    await this.prisma.session.deleteMany({
      where: { refreshToken },
    });
  }

  async registerUser(req: Request, res: Response) {
    const { fullName, email, phone } = req.body;

    if (!fullName || !email || !phone) {
      return res.status(400).json({ message: "All fields are required" });
    }
    let userExist = await this.prisma.user.findFirst({
      where: { email },
    });

    if (userExist) {
      throw new NotFoundException("User already exists"); // 404
    }

    const token = Crypto.randomBytes(16).toString("hex");
    const expiresAt = Date.now() + 24 * 60 * 60 * 1000;

    await this.prisma.user.create({
      data: {
        name: fullName,
        email,
        verificationToken: token,
        setupTokenExpires: expiresAt,
        isActive: false,
      },
    });
    sendSetupPasswordEmail(email, token);

    return res.status(200).json({
      message:
        "User registered successfully. Please check your email to set up your password.",
    });
  }

  async setupPassword(token: string, password: string, Res: Response) {
    const user = await this.prisma.user.findFirst({
      where: { verificationToken: token },
    });
    if (!user) {
      throw new Error("Invalid token");
    }

    if (user.setupTokenExpires && user.setupTokenExpires < Date.now()) {
      console.log(" Date.now()", Date.now());

      throw new Error("Token expired");
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        isActive: true,
        verificationToken: null,
        setupTokenExpires: null,
      },
    });
    return Res.status(200).json({
      message: "Password set up successfully. You can now log in.",
    });
  }

  async forgetPassword(email: string, res: Response) {
    const user = await this.prisma.user.findFirst({
      where: { email: email },
    });
    if (!user) {
      throw new Error("Invalid user");
    }

    let resetPassword = process.env.PASSWORDRESET;
    let passWordHash = await bcrypt.hash(resetPassword?.toString()!, 10);

    const token = Crypto.randomBytes(16).toString("hex");
    const expiresAt = Date.now() + 24 * 60 * 60 * 1000;
    try {
      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          password: passWordHash,
          verificationToken: token,
          setupTokenExpires: expiresAt,
        },
      });

      sendSetupPasswordEmail(email, token);
      return res.status(200).json({
        message: "Please check your email to set up your password.",
      });
    } catch (error) {
      return error;
    }
  }
}
