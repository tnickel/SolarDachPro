import { Request, Response, NextFunction } from "express";
import { clientsService } from "../services/clients.service";

/**
 * Controller for CommercialClient endpoints.
 * Handles HTTP request/response, delegates business logic to service layer.
 */
export const clientsController = {
  /**
   * GET /api/v1/clients
   * List all clients, optionally filtered by search query.
   */
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const search = req.query.search as string | undefined;
      const clients = await clientsService.findAll(search);

      res.json({
        success: true,
        data: clients,
        count: clients.length,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/v1/clients/:id
   * Retrieve a single client with all related projects.
   */
  async getById(req: Request<{ id: string }>, res: Response, next: NextFunction) {
    try {
      const client = await clientsService.findById(req.params.id);

      res.json({
        success: true,
        data: client,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/v1/clients
   * Create a new commercial client.
   */
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const client = await clientsService.create(req.body);

      res.status(201).json({
        success: true,
        data: client,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * PUT /api/v1/clients/:id
   * Update an existing client.
   */
  async update(req: Request<{ id: string }>, res: Response, next: NextFunction) {
    try {
      const client = await clientsService.update(req.params.id, req.body);

      res.json({
        success: true,
        data: client,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * DELETE /api/v1/clients/:id
   * Delete a client and all related data.
   */
  async delete(req: Request<{ id: string }>, res: Response, next: NextFunction) {
    try {
      await clientsService.delete(req.params.id);

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },
};
