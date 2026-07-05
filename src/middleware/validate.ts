import { validationResult } from "express-validator";
import { Request, Response, NextFunction } from "express";
import createError from "http-errors";

/**
 * Middleware principale di validazione: controlla se ci sono errori di validazione e li trasforma in errore 400.
 */
export function validate(req: Request, res: Response, next: NextFunction) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const messages = errors.array().map(err => 
      "param" in err ? `${err.param}: ${err.msg}` : err.msg
    );
    return next(createError.BadRequest(messages.join(", ")));
  }
  next();
}

/**
 * Middleware per rifiutare campi non consentiti nel body.
 * @param allowedFields - array di nomi di campi permessi
 * @returns una funzione per express-validator
 */
export function noExtraFields(allowedFields: string[]) {
  return (value: any) => {
    const extra = Object.keys(value).filter(k => !allowedFields.includes(k));
    if (extra.length > 0) {
      throw new Error(`Campi non consentiti: ${extra.join(', ')}`);
    }
    return true;
  };
}

/**
 * Middleware per rifiutare parametri query non consentiti.
 * @param allowedParams - array di nomi di parametri permessi
 * @returns una funzione per express-validator
 */
export function noExtraQuery(allowedParams: string[]) {
  return (_value: any, { req }: any) => {
    const extra = Object.keys(req.query).filter(
      key => !allowedParams.includes(key)
    );
    if (extra.length > 0) {
      throw new Error(`Parametri di query non consentiti: ${extra.join(", ")}`);
    }
    return true;
  };
}

/**
 * Validatore personalizzato per controllare la griglia in base a width/height.
 * Deve essere usato con express-validator: body('grid').custom(validateGridDimensions)
 */
export function validateGridDimensions(value: any, { req }: any) {
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
}