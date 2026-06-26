import { Router } from "express";
import { UpdateRequestController } from "../controllers/UpdateRequestController";
import { UpdateRequestService } from "../services/UpdateRequestService";
import { UpdateRequestRepository } from "../repositories/UpdateRequestRepository";
import { GridModelRepository } from "../repositories/GridModelRepository";
import { UserRepository } from "../repositories/UserRepository";
import { authMiddleware } from "../middleware/authMiddleware";
import { body } from "express-validator";
import { validate } from "../middleware/validate";

const router = Router();

const updateRepo = new UpdateRequestRepository();
const modelRepo = new GridModelRepository();
const userRepo = new UserRepository();
const updateService = new UpdateRequestService(updateRepo, modelRepo, userRepo);
const updateController = new UpdateRequestController(updateService);

router.get("/sent", authMiddleware, updateController.getSentRequests);
router.get("/received", authMiddleware, updateController.getReceivedRequests);
router.get("/history/:modelId", authMiddleware, updateController.getHistory);
router.get("/status/:modelId", authMiddleware, updateController.getModelStatus);

router.post(
  "/create",
  authMiddleware,
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

router.post(
  "/:id/approve",
  authMiddleware,
  [body().custom(() => true)],
  validate,
  updateController.approveRequest
);

router.post(
  "/:id/reject",
  authMiddleware,
  [body().custom(() => true)],
  validate,
  updateController.rejectRequest
);

router.post(
  "/bulk",
  authMiddleware,
  [
    body("approve").optional().isArray(),
    body("reject").optional().isArray()
  ],
  validate,
  updateController.bulkUpdate
);

export default router;
