import express from "express";
import authRoutes from "./auth.router";
const router = express.Router();

//api routers
router.use("/auth", authRoutes);

export default router;
