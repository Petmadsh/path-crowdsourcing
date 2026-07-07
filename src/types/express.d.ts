import "express";

declare global { // Estensione dell'interfaccia Request di Express per includere le informazioni dell'utente autenticato
  namespace Express {
    interface Request {
      user: {
        id: number;
        role: string;
      };
    }
  }
}

export {};
