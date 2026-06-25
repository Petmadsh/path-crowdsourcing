import { Router } from "express";
import { AuthController } from "../controllers/AuthController";
import { AuthService } from "../services/AuthService";
import { UserRepository } from "../repositories/UserRepository";
import { body } from "express-validator";
import { validate } from "../middleware/validate";

const router = Router();

const userRepo = new UserRepository();
const authService = new AuthService(userRepo);
const authController = new AuthController(authService);

router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Email non valida"),
    body("password").isString().notEmpty().withMessage("Password obbligatoria")
  ],
  validate,
  authController.login
);

export default router;
