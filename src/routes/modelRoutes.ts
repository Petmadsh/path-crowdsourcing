import { Router } from "express";
import { ModelController } from "../controllers/ModelController";
import { ModelService } from "../services/ModelService";
import { GridModelRepository } from "../repositories/GridModelRepository";
import { UserRepository } from "../repositories/UserRepository";
import { authMiddleware } from "../middleware/authMiddleware";
import { tokenCheckMiddleware } from "../middleware/tokenCheckMiddleware";
import { roleMiddleware } from "../middleware/roleMiddleware";
import { body, param } from "express-validator";
import { validate } from "../middleware/validate";

const router = Router();

const modelRepo = new GridModelRepository();
const userRepo = new UserRepository();
const modelService = new ModelService(modelRepo, userRepo);
const modelController = new ModelController(modelService);

// Validazione personalizzata per la griglia
const validateGridDimensions = (value: any, { req }: any) => {
  const { height, width } = req.body;

  // Se height o width non sono definiti/numerici, saltiamo i controlli dimensionali 
  if (height === undefined || width === undefined || typeof height !== 'number' || typeof width !== 'number') {
    return true;
  }
  
  // Verifica che la griglia sia un array
  if (!Array.isArray(value)) {
    throw new Error("Grid deve essere un array");
  }
  
  // Verifica il numero di righe
  if (value.length !== height) {
    throw new Error(`La griglia deve avere ${height} righe (height), ma ne ha ${value.length}`);
  }
  
  // Verifica il numero di colonne per ogni riga
  for (let i = 0; i < value.length; i++) {
    if (!Array.isArray(value[i])) {
      throw new Error(`La riga ${i} deve essere un array`);
    }
    if (value[i].length !== width) {
      throw new Error(`La riga ${i} deve avere ${width} colonne (width), ma ne ha ${value[i].length}`);
    }
  }
  
  return true;
};

// Validazione per campi extra non consentiti
const noExtraFields = (allowedFields: string[]) => {
  return (value: any) => {
    const extra = Object.keys(value).filter(k => !allowedFields.includes(k));
    if (extra.length > 0) {
      throw new Error(`Campi non consentiti: ${extra.join(', ')}`);
    }
    return true;
  };
};

// GET /models
router.get(
  "/",
  authMiddleware,
  roleMiddleware("user"),
  tokenCheckMiddleware,
  modelController.getMyModels
);

// GET /models/:id
router.get(
  "/:id",
  authMiddleware,
  roleMiddleware("user"),
  tokenCheckMiddleware,
  [param("id").isInt({ min: 1 }).withMessage("ID modello non valido")],
  validate,
  modelController.getModelById
);

// POST /models/create
router.post(
  "/create",
  authMiddleware,
  roleMiddleware("user"),
  tokenCheckMiddleware,
  [
    // 1. Campi extra non consentiti
    body().custom(noExtraFields(['width', 'height', 'grid'])),
    
    // 2. Validazione width
    body("width")
      .notEmpty()
      .withMessage("width è obbligatorio")
      .bail()
      .isInt({ min: 1 })
      .withMessage("width deve essere un numero intero >= 1"),
    
    // 3. Validazione height
    body("height")
      .notEmpty()
      .withMessage("height è obbligatorio")
      .bail()
      .isInt({ min: 1 })
      .withMessage("height deve essere un numero intero >= 1"),
    
    // 4. Validazione grid (con verifiche di dimensione)
    body("grid")
      .notEmpty()
      .withMessage("grid è obbligatorio")
      .bail()
      .isArray()
      .withMessage("grid deve essere un array")
      .bail()
      .custom(validateGridDimensions),
    
    // 5. Validazione dei valori delle celle
    body("grid.*.*")
      .isInt({ min: 0, max: 1 })
      .withMessage("Ogni cella deve essere 0 o 1"),
  ],
  validate,
  modelController.createModel
);

// POST /models/:id/execute
router.post(
  "/:id/execute",
  authMiddleware,
  roleMiddleware("user"),
  tokenCheckMiddleware,
  [
    // 1. Parametro ID
    param("id")
      .isInt({ min: 1 })
      .withMessage("ID modello non valido"),
    
    // 2. Campi extra non consentiti
    body().custom(noExtraFields(['start', 'goal'])),
    
    // 3. Validazione start
    body("start")
      .notEmpty()
      .withMessage("start è obbligatorio")
      .bail()
      .isObject()
      .withMessage("start deve essere un oggetto"),
    
    body("start.x")
      .notEmpty()
      .withMessage("start.x è obbligatorio")
      .bail()
      .isInt({ min: 0 })
      .withMessage("start.x deve essere un numero intero >= 0"),
    
    body("start.y")
      .notEmpty()
      .withMessage("start.y è obbligatorio")
      .bail()
      .isInt({ min: 0 })
      .withMessage("start.y deve essere un numero intero >= 0"),
    
    // 4. Validazione goal
    body("goal")
      .notEmpty()
      .withMessage("goal è obbligatorio")
      .bail()
      .isObject()
      .withMessage("goal deve essere un oggetto"),
    
    body("goal.x")
      .notEmpty()
      .withMessage("goal.x è obbligatorio")
      .bail()
      .isInt({ min: 0 })
      .withMessage("goal.x deve essere un numero intero >= 0"),
    
    body("goal.y")
      .notEmpty()
      .withMessage("goal.y è obbligatorio")
      .bail()
      .isInt({ min: 0 })
      .withMessage("goal.y deve essere un numero intero >= 0"),
  ],
  validate,
  modelController.executeModel
);

export default router;