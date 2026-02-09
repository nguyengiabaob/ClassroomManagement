import { Router } from "express";
import { authController } from "../Controllers/auth.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const route = Router();
route.post("/createAccessCode", authController.createAccesscode);

route.post("/validateAccessCode", authController.validateAccessCode);

route.post("/registerUser", authController.registerUser);

route.post("/setupPassword", authController.setupPassword);

// route.post("/registerUser", authController.registerUser);

export default route;
