import { Router } from "express";
import { UpdateRequestController } from "../controllers/UpdateRequestController";
import { UpdateRequestService } from "../services/UpdateRequestService";
import { UpdateRequestRepository } from "../repositories/UpdateRequestRepository";
import { GridModelRepository } from "../repositories/GridModelRepository";
import { UserRepository } from "../repositories/UserRepository";
import { authMiddleware } from "../middleware/authMiddleware";
import { tokenCheckMiddleware } from "../middleware/tokenCheckMiddleware";
import { roleMiddleware } from "../middleware/roleMiddleware";
import { body, param, query } from "express-validator";
import { validate,noExtraFields,noExtraQuery } from "../middleware/validate";

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
  roleMiddleware("user"),
  tokenCheckMiddleware,
  updateController.getSentRequests
);

// GET /updates/received
router.get(
  "/received",
  authMiddleware,
  roleMiddleware("user"),
  tokenCheckMiddleware,
  updateController.getReceivedRequests
);

// GET /updates/history/:modelId
router.get(
  "/history/:modelId",
  authMiddleware,
  roleMiddleware("user"),
  tokenCheckMiddleware,
  [
  query().custom(noExtraQuery(["from", "to", "status"])),

  param("modelId")
    .isInt({ min: 1 })
    .withMessage("ID modello non valido"),

  query("from")
    .optional()
    .isISO8601()
    .withMessage("Il parametro 'from' deve essere una data valida (YYYY-MM-DD)"),

  query("to")
    .optional()
    .isISO8601()
    .withMessage("Il parametro 'to' deve essere una data valida (YYYY-MM-DD)"),

  query("status")
    .optional()
    .isIn(["pending", "approved", "rejected"])
    .withMessage("Status non valido"),
],
  validate,
  updateController.getHistory
);

// GET /updates/status/:modelId
router.get(
  "/status/:modelId",
  authMiddleware,
  roleMiddleware("user"),
  tokenCheckMiddleware,
  updateController.getModelStatus
);

// POST /updates/create
router.post(
  "/create",
  authMiddleware,
  roleMiddleware("user"),
  tokenCheckMiddleware,
  [
    // 1. Campi extra non consentiti
    body().custom(noExtraFields(['modelId', 'cells'])),
    
    // 2. Validazione modelId
    body("modelId")
      .notEmpty()
      .withMessage("modelId è obbligatorio")
      .bail()
      .isInt({ min: 1 })
      .withMessage("modelId deve essere un numero intero >= 1")
      .bail()
      .toInt(),
    
    // 3. Validazione cells: deve essere un array NON VUOTO
    body("cells")
      .isArray({ min: 1 })
      .withMessage("cells e' obbligatorio e deve essere un array non vuoto")
      .bail(),
    
    // 4. Validazione di ogni cella (solo se cells è valido)
    body("cells.*.x")
      .notEmpty()
      .withMessage("x è obbligatorio per ogni cella")
      .bail()
      .isInt({ min: 0 })
      .withMessage("x deve essere un numero intero >= 0")
      .bail()
      .toInt(),

    
    body("cells.*.y")
      .notEmpty()
      .withMessage("y è obbligatorio per ogni cella")
      .bail()
      .isInt({ min: 0 })
      .withMessage("y deve essere un numero intero >= 0")
      .bail()
      .toInt(),
    
    body("cells.*.newValue")
      .notEmpty()
      .withMessage("newValue è obbligatorio per ogni cella")
      .bail()
      .isInt({ min: 0, max: 1 })
      .withMessage("newValue deve essere 0 o 1")
      .bail()
      .toInt(),
  ],
  validate,
  updateController.createRequest
);

// POST /updates/:id/approve
router.post(
  "/:id/approve",
  authMiddleware,
  roleMiddleware("user"),
  tokenCheckMiddleware,
  [
    param("id")
      .isInt({ min: 1 })
      .withMessage("ID richiesta non valido"),
  ],
  validate,
  updateController.approveRequest
);

// POST /updates/:id/reject
router.post(
  "/:id/reject",
  authMiddleware,
  roleMiddleware("user"),
  tokenCheckMiddleware,
  [
    param("id")
      .isInt({ min: 1 })
      .withMessage("ID richiesta non valido"),
  ],
  validate,
  updateController.rejectRequest
);

// POST /updates/bulk
router.post(
  "/bulk",
  authMiddleware,
  roleMiddleware("user"),
  tokenCheckMiddleware,
  [
    // 1. Campi extra non consentiti
    body().custom(noExtraFields(['approve', 'reject'])),
    
    // 2. Validazione approve
    body("approve")
      .optional()
      .isArray()
      .withMessage("approve deve essere un array")
      .bail(),
    
    body("approve.*")
      .isInt({ min: 1 })
      .withMessage("Ogni ID in approve deve essere un numero intero >= 1"),
    
    // 3. Validazione reject
    body("reject")
      .optional()
      .isArray()
      .withMessage("reject deve essere un array")
      .bail(),
    
    body("reject.*")
      .isInt({ min: 1 })
      .withMessage("Ogni ID in reject deve essere un numero intero >= 1"),
  ],
  validate,
  updateController.bulkUpdate
);

export default router;