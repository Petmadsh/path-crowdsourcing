import { Request, Response, NextFunction } from "express";
import { UpdateRequestService } from "../services/UpdateRequestService";

export class UpdateRequestController {
  constructor(private updateService: UpdateRequestService) {}

  createRequest = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { modelId, cells } = req.body;
      const requesterId = req.user.id;

      const result = await this.updateService.createRequest(
        modelId,
        requesterId,
        cells
      );
      res.json(result);
    } catch (err) {
      next(err);
    }
  }; // Gestore per creare una nuova richiesta di aggiornamento

  approveRequest = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const requestId = Number(req.params.id);
      const approverId = req.user.id;

      const result = await this.updateService.approveRequest(
        requestId,
        approverId
      );
      res.json(result);
    } catch (err) {
      next(err);
    } // Gestore per approvare una richiesta di aggiornamento
  };

  rejectRequest = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const requestId = Number(req.params.id);
      const approverId = req.user.id;

      const result = await this.updateService.rejectRequest(
        requestId,
        approverId
      );
      res.json(result);
    } catch (err) {
      next(err);
    } // Gestore per rifiutare una richiesta di aggiornamento
  };

  getSentRequests = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const requesterId = req.user.id;
      const requests = await this.updateService.getRequestsByRequester(requesterId);
      res.json(requests);
    } catch (err) {
      next(err);
    } // Gestore per ottenere le richieste inviate dall'utente autenticato
  };

  getReceivedRequests = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const ownerId = req.user.id;
      const requests = await this.updateService.getRequestsForOwner(ownerId);
      res.json(requests);
    } catch (err) {
      next(err);
    }// Gestore per ottenere le richieste ricevute dall'utente autenticato
  };

  getHistory = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const modelId = Number(req.params.modelId);
      const filters = {
        from: req.query.from ? String(req.query.from) : undefined,
        to: req.query.to ? String(req.query.to) : undefined,
        status: req.query.status ? String(req.query.status) : undefined,
      };
      const result = await this.updateService.getHistory(modelId, filters);
      res.json(result);
    } catch (err) {
      next(err);
    }// Gestore per ottenere la cronologia delle richieste di aggiornamento per un modello specifico
  };

  getModelStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const modelId = Number(req.params.modelId);
      const result = await this.updateService.getModelStatus(modelId);
      res.json(result);
    } catch (err) {
      next(err);
    }// Gestore per ottenere lo stato attuale delle richieste di aggiornamento per un modello specifico
  };

  bulkUpdate = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const approverId = req.user.id;
      const { approve = [], reject = [] } = req.body;
      const result = await this.updateService.bulkUpdate(approverId, approve, reject);
      res.json(result);
    } catch (err) {
      next(err);
    }// Gestore per approvare o rifiutare in blocco le richieste di aggiornamento
  };
}