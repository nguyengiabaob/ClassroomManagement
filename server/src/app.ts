import * as admin from "firebase-admin";
import * as dotenv from "dotenv";
import * as socketIo from "socket.io";
import express from "express";
import http from "http";
import { socketService } from "./socket";
dotenv.config();
admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY,
  }),
});

const db = admin.firestore();
const app = express();
const server = http.createServer(app);
const io = new socketIo.Server(server, {
  cors: {
    origin: "*",
  },
});
socketService(io);

const dbRealTime = admin.database();
export { db, dbRealTime };
