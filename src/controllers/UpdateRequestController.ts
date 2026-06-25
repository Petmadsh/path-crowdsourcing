import { Request, Response } from "express";
import { UpdateRequestService } from "../services/UpdateRequestService";

export class UpdateRequestController {
  constructor(private updateService: UpdateRequestService) {}

  // Creazione richiesta (o applicazione immediata se owner)
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
      res.status(400).json({ error: error.message });
    }
  };

  // APPROVAZIONE (solo owner)
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
      res.status(400).json({ error: error.message });
    }
  };

  // RIFIUTO (solo owner)
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
      res.status(400).json({ error: error.message });
    }
  };
}
