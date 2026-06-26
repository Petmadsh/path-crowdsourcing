import { Router } from "express";
import { AuthController } from "../controllers/AuthController";
import { AuthService } from "../services/AuthService";
import { UserRepository } from "../repositories/UserRepository";
import { body } from "express-validator";
import { validate } from "../middleware/validate";
import { authMiddleware } from "../middleware/authMiddleware";
import { roleMiddleware } from "../middleware/roleMiddleware";

const router = Router();

const userRepo = new UserRepository();
const authService = new AuthService(userRepo);
const authController = new AuthController(authService);

// Login standard (Pubblico)
router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Email non valida"),
    body("password").isString().notEmpty().withMessage("Password obbligatoria")
  ],
  validate,
  authController.login
);

router.post(
  "/refill",
  authMiddleware,
  roleMiddleware("admin"), // Solo gli admin possono passare questo anello della catena
  [
    body("email").isEmail().withMessage("Inserire un'email utente valida"),
    body("amount").isFloat({ gt: 0 }).withMessage("L'ammontare della ricarica deve essere maggiore di 0")
  ],
  validate,
  authController.refillTokens
);

export default router;