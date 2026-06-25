import { Router } from "express";
import { UpdateRequestController } from "../controllers/UpdateRequestController";
import { UpdateRequestService } from "../services/UpdateRequestService";
import { UpdateRequestRepository } from "../repositories/UpdateRequestRepository";
import { GridModelRepository } from "../repositories/GridModelRepository";
import { authMiddleware } from "../middleware/authMiddleware";
import { body } from "express-validator";
import { validate } from "../middleware/validate";

const router = Router();

const updateRepo = new UpdateRequestRepository();
const modelRepo = new GridModelRepository();
const updateService = new UpdateRequestService(updateRepo, modelRepo);
const updateController = new UpdateRequestController(updateService);

// Creazione richiesta (o applicazione immediata se owner)
router.post(
  "/create",
  authMiddleware,
  [
    body("modelId").isInt({ min: 1 }),
    body("cells").isArray().withMessage("Cells deve essere un array"),
    body("cells.*.x").isInt({ min: 0 }),
    body("cells.*.y").isInt({ min: 0 }),
    body("cells.*.newValue")
      .isInt({ min: 0, max: 1 })
      .withMessage("newValue deve essere 0 o 1")
  ],
  validate,
  updateController.createRequest
);

// Approvazione richiesta (solo owner del modello)
router.post(
  "/:id/approve",
  authMiddleware,
  [
    body().custom(() => true) // nessun body richiesto
  ],
  validate,
  updateController.approveRequest
);

// Rifiuto richiesta (solo owner del modello)
router.post(
  "/:id/reject",
  authMiddleware,
  [
    body().custom(() => true)
  ],
  validate,
  updateController.rejectRequest
);

export default router;
