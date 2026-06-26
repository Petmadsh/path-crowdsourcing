import { Router } from "express";
import { ModelController } from "../controllers/ModelController";
import { ModelService } from "../services/ModelService";
import { GridModelRepository } from "../repositories/GridModelRepository";
import { UserRepository } from "../repositories/UserRepository";
import { authMiddleware } from "../middleware/authMiddleware";
import { body, param } from "express-validator";
import { validate } from "../middleware/validate";

const router = Router();

// Iniezione dipendenze
const modelRepo = new GridModelRepository();
const userRepo = new UserRepository();
const modelService = new ModelService(modelRepo, userRepo);
const modelController = new ModelController(modelService);

router.get("/", authMiddleware, modelController.getMyModels);

router.get(
  "/:id",
  authMiddleware,
  [param("id").isInt({ min: 1 }).withMessage("ID modello non valido")],
  validate,
  modelController.getModelById
);

router.post(
  "/create",
  authMiddleware,
  [
    body("width").isInt({ min: 1 }).withMessage("Width deve essere >= 1"),
    body("height").isInt({ min: 1 }).withMessage("Height deve essere >= 1"),
    body("grid").isArray().withMessage("Grid deve essere un array"),
    body("grid.*").isArray().withMessage("Ogni riga deve essere un array"),
    body("grid.*.*")
      .isInt({ min: 0, max: 1 })
      .withMessage("Ogni cella deve essere 0 o 1")
  ],
  validate,
  modelController.createModel
);

router.post(
  "/:id/execute",
  authMiddleware,
  [
    param("id").isInt({ min: 1 }).withMessage("ID modello non valido"),
    body("start.x").isInt({ min: 0 }),
    body("start.y").isInt({ min: 0 }),
    body("goal.x").isInt({ min: 0 }),
    body("goal.y").isInt({ min: 0 })
  ],
  validate,
  modelController.executeModel
);

export default router;
