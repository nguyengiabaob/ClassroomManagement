import { Injectable } from "@nestjs/common";
import { db } from "../firebase";

@Injectable()
export class authServices {
  constructor(
    private prisma: PrismaService,
    // private jwt: JwtService,
  ) {}
  static generateVerifycationCode = () => {
    return Math.floor(100000 + Math.random() * 900000);
  };

  static CreateAccessCode = async (phoneNumber: string, accessCode: number) => {
    try {
      let SaveCode = await db
        .collection("accessCodes")
        .doc(phoneNumber)
        .set({
          code: accessCode,
          expireAt: Date.now() + 5 * 60 * 1000,
          attempts: 0,
          // createAt : admin
        });

      //await TwilioService.sendVerificationCode(phoneNumber, accessCode);
    } catch (error) {}
  };
}
