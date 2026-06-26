import { Request, Response } from "express";
import { UpdateRequestService } from "../services/UpdateRequestService";

export class UpdateRequestController {
  constructor(private updateService: UpdateRequestService) {}

  createRequest = async (req: Request, res: Response) => {
    try {
      const { modelId, cells } = req.body;
      const requesterId = req.user.id;

      const result = await this.updateService.createRequest(
        modelId,
        requesterId,
        cells
      );

      res.json(result);
    } catch (error: any) {
      res.status(error.status || 400).json({ error: error.message });
    }
  };

  approveRequest = async (req: Request, res: Response) => {
    try {
      const requestId = Number(req.params.id);
      const approverId = req.user.id;

      const result = await this.updateService.approveRequest(
        requestId,
        approverId
      );

      res.json(result);
    } catch (error: any) {
      res.status(error.status || 400).json({ error: error.message });
    }
  };

  rejectRequest = async (req: Request, res: Response) => {
    try {
      const requestId = Number(req.params.id);
      const approverId = req.user.id;

      const result = await this.updateService.rejectRequest(
        requestId,
        approverId
      );

      res.json(result);
    } catch (error: any) {
      res.status(error.status || 400).json({ error: error.message });
    }
  };

  getSentRequests = async (req: Request, res: Response) => {
    try {
      const requesterId = req.user.id;
      const requests = await this.updateService.getRequestsByRequester(requesterId);
      res.json(requests);
    } catch (error: any) {
      res.status(error.status || 400).json({ error: error.message });
    }
  };

  getReceivedRequests = async (req: Request, res: Response) => {
    try {
      const ownerId = req.user.id;
      const requests = await this.updateService.getRequestsForOwner(ownerId);
      res.json(requests);
    } catch (error: any) {
      res.status(error.status || 400).json({ error: error.message });
    }
  };

  /**
   * MODIFICATO: Estrazione e mappatura esplicita dei filtri di data
   * Consente query del tipo: /updates/history/1?from=2026-06-01&to=2026-06-30&status=approved
   */
  getHistory = async (req: Request, res: Response) => {
    try {
      const modelId = Number(req.params.modelId);
      
      // Mappatura pulita e sicura dei parametri attesi dal repository
      const filters = {
        from: req.query.from ? String(req.query.from) : undefined,
        to: req.query.to ? String(req.query.to) : undefined,
        status: req.query.status ? String(req.query.status) : undefined
      };

      const result = await this.updateService.getHistory(modelId, filters);
      res.json(result);
    } catch (error: any) {
      res.status(error.status || 400).json({ error: error.message });
    }
  };

  getModelStatus = async (req: Request, res: Response) => {
    try {
      const modelId = Number(req.params.modelId);
      const result = await this.updateService.getModelStatus(modelId);
      res.json(result);
    } catch (error: any) {
      res.status(error.status || 400).json({ error: error.message });
    }
  };

  bulkUpdate = async (req: Request, res: Response) => {
    try {
      const approverId = req.user.id;
      const { approve = [], reject = [] } = req.body;
      const result = await this.updateService.bulkUpdate(approverId, approve, reject);
      res.json(result);
    } catch (error: any) {
      res.status(error.status || 400).json({ error: error.message });
    }
  };
}