import { Router } from "express";
import { UpdateRequestController } from "../controllers/UpdateRequestController";
import { UpdateRequestService } from "../services/UpdateRequestService";
import { UpdateRequestRepository } from "../repositories/UpdateRequestRepository";
import { GridModelRepository } from "../repositories/GridModelRepository";
import { UserRepository } from "../repositories/UserRepository";
import { authMiddleware } from "../middleware/authMiddleware";
import { tokenCheckMiddleware } from "../middleware/tokenCheckMiddleware"; // importalo
import { body, param, query } from "express-validator";
import { validate } from "../middleware/validate";

const router = Router();

const updateRepo = new UpdateRequestRepository();
const modelRepo = new GridModelRepository();
const userRepo = new UserRepository();
const updateService = new UpdateRequestService(updateRepo, modelRepo, userRepo);
const updateController = new UpdateRequestController(updateService);

// GET /updates/sent
router.get(
  "/sent",
  authMiddleware,
  tokenCheckMiddleware,
  updateController.getSentRequests
);

// GET /updates/received
router.get(
  "/received",
  authMiddleware,
  tokenCheckMiddleware,
  updateController.getReceivedRequests
);

// GET /updates/history/:modelId
router.get(
  "/history/:modelId",
  authMiddleware,
  tokenCheckMiddleware,
  [
    param("modelId").isInt({ min: 1 }).withMessage("ID modello non valido"),
    query("from").optional().isISO8601().withMessage("Il parametro 'from' deve essere una data valida (YYYY-MM-DD)"),
    query("to").optional().isISO8601().withMessage("Il parametro 'to' deve essere una data valida (YYYY-MM-DD)"),
    query("status").optional().isIn(["pending", "approved", "rejected"]).withMessage("Status non valido")
  ],
  validate,
  updateController.getHistory
);

// GET /updates/status/:modelId
router.get(
  "/status/:modelId",
  authMiddleware,
  tokenCheckMiddleware,
  updateController.getModelStatus
);

// POST /updates/create
router.post(
  "/create",
  authMiddleware,
  tokenCheckMiddleware,
  [
    body("modelId").isInt({ min: 1 }),
    body("cells").isArray(),
    body("cells.*.x").isInt({ min: 0 }),
    body("cells.*.y").isInt({ min: 0 }),
    body("cells.*.newValue").isInt({ min: 0, max: 1 })
  ],
  validate,
  updateController.createRequest
);

// POST /updates/:id/approve
router.post(
  "/:id/approve",
  authMiddleware,
  tokenCheckMiddleware,
  [body().custom(() => true)],
  validate,
  updateController.approveRequest
);

// POST /updates/:id/reject
router.post(
  "/:id/reject",
  authMiddleware,
  tokenCheckMiddleware,
  [body().custom(() => true)],
  validate,
  updateController.rejectRequest
);

// POST /updates/bulk
router.post(
  "/bulk",
  authMiddleware,
  tokenCheckMiddleware,
  [
    body("approve").optional().isArray(),
    body("reject").optional().isArray()
  ],
  validate,
  updateController.bulkUpdate
);

export default router;