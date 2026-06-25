import { Router } from "express";
import { UpdateRequestController } from "../controllers/UpdateRequestController";
import { UpdateRequestService } from "../services/UpdateRequestService";
import { UpdateRequestRepository } from "../repositories/UpdateRequestRepository";
import { GridModelRepository } from "../repositories/GridModelRepository";
import { authMiddleware } from "../middleware/authMiddleware";

const router = Router();

const updateRepo = new UpdateRequestRepository();
const modelRepo = new GridModelRepository();
const updateService = new UpdateRequestService(updateRepo, modelRepo);
const updateController = new UpdateRequestController(updateService);

// Creazione richiesta (o applicazione immediata se owner)
router.post(
  "/create",
  authMiddleware,
  updateController.createRequest
);

// Approvazione richiesta (solo owner del modello)
router.post(
  "/:id/approve",
  authMiddleware,
  updateController.approveRequest
);

// Rifiuto richiesta (solo owner del modello)
router.post(
  "/:id/reject",
  authMiddleware,
  updateController.rejectRequest
);

export default router;
