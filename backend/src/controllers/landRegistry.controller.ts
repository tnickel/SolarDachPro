import { Request, Response, NextFunction } from "express";
import { landRegistryService } from "../services/landRegistry.service";

/**
 * Controller for LandRegistry (Grundbuch) endpoints.
 */
export const landRegistryController = {
  /**
   * GET /api/v1/land-registry
   * List all land registry entries, optionally filtered.
   */
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const { legalStatus, projectId } = req.query as {
        legalStatus?: string;
        projectId?: string;
      };

      const entries = await landRegistryService.findAll({
        legalStatus: legalStatus as any,
        projectId,
      });

      res.json({
        success: true,
        data: entries,
        count: entries.length,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/v1/land-registry/:id
   * Retrieve a single land registry entry.
   */
  async getById(req: Request<{ id: string }>, res: Response, next: NextFunction) {
    try {
      const entry = await landRegistryService.findById(req.params.id);

      res.json({
        success: true,
        data: entry,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/v1/land-registry
   * Create a new land registry entry.
   */
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const entry = await landRegistryService.create(req.body);

      res.status(201).json({
        success: true,
        data: entry,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * PATCH /api/v1/land-registry/:id/status
   * Update the legal review status of a land registry entry.
   *
   * This is the primary endpoint for the legal review workflow:
   * PENDING → IN_REVIEW → APPROVED / REJECTED / REQUIRES_CLARIFICATION
   */
  async updateStatus(req: Request<{ id: string }>, res: Response, next: NextFunction) {
    try {
      const { legalStatus, legalNotes } = req.body;

      const entry = await landRegistryService.updateStatus(
        req.params.id,
        legalStatus,
        legalNotes
      );

      res.json({
        success: true,
        data: entry,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * PUT /api/v1/land-registry/:id
   * Full update of a land registry entry.
   */
  async update(req: Request<{ id: string }>, res: Response, next: NextFunction) {
    try {
      const entry = await landRegistryService.update(req.params.id, req.body);

      res.json({
        success: true,
        data: entry,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * DELETE /api/v1/land-registry/:id
   * Delete a land registry entry.
   */
  async delete(req: Request<{ id: string }>, res: Response, next: NextFunction) {
    try {
      await landRegistryService.delete(req.params.id);

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },
};
