import { Router } from "express";
import { AuthController } from "../controllers/AuthController";
import { AuthService } from "../services/AuthService";
import { UserRepository } from "../repositories/UserRepository";
import { body } from "express-validator";
import { validate, noExtraFields } from "../middleware/validate";
import { authMiddleware } from "../middleware/authMiddleware";
import { roleMiddleware } from "../middleware/roleMiddleware";

const router = Router();

const userRepo = new UserRepository();
const authService = new AuthService(userRepo);
const authController = new AuthController(authService);

// Login
router.post(
  "/login",
  [
   
    body().custom(noExtraFields(['email', 'password'])),
    
    body("email")
      .notEmpty().withMessage("email è obbligatoria")
      .bail()
      .isEmail().withMessage("email non è valida"),
      
    body("password")
      .notEmpty().withMessage("password è obbligatoria")
  ],
  validate,
  authController.login
);

// Ricarica token (solo admin)
router.post(
  "/refill",
  authMiddleware,
  roleMiddleware("admin"),
  [
    // Controllo campi extra: solo 'email' e 'amount'
    body().custom(noExtraFields(['email', 'amount'])),
    
    body("email")
      .notEmpty().withMessage("email è obbligatoria")
      .bail()
      .isEmail().withMessage("email non è valida"),

    body("amount")
      .notEmpty().withMessage("amount è obbligatorio")
      .bail()
      .isFloat({ gt: 0 }).withMessage("amount deve essere un numero positivo")
      .bail()
      .toFloat()
  ],
  validate,
  authController.refillTokens
);

export default router;