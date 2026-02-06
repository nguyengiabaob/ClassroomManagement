import "twilio";
import * as dotenv from "dotenv";
import { Twilio } from "twilio";
dotenv.config();

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = new Twilio(accountSid, authToken);

const sendVerificationCode = async (phoneNumber: string, code: string) => {
  try {
    const message = await client.messages.create({
      body: `Your verification code is ${code}. Do not share it with anyone!`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phoneNumber,
    });
    console.log(message);
  } catch (error) {
    console.log(error);
  }
};
