import { Router } from "express";
import { ModelController } from "../controllers/ModelController";
import { ModelService } from "../services/ModelService";
import { GridModelRepository } from "../repositories/GridModelRepository";
import { UserRepository } from "../repositories/UserRepository";
import { authMiddleware } from "../middleware/authMiddleware";

const router = Router();

const modelRepo = new GridModelRepository();
const userRepo = new UserRepository();
const modelService = new ModelService(modelRepo, userRepo);
const modelController = new ModelController(modelService);

router.post("/create", authMiddleware, modelController.createModel);
router.post("/:id/execute", authMiddleware, modelController.executeModel);

export default router;
