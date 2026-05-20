import { Request, Response, NextFunction } from "express";
import { projectsService } from "../services/projects.service";

/**
 * Controller for SolarProject endpoints.
 */
export const projectsController = {
  /**
   * GET /api/v1/projects
   * List all projects, optionally filtered by status or clientId.
   */
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const { status, clientId } = req.query as {
        status?: string;
        clientId?: string;
      };

      const projects = await projectsService.findAll({
        status: status as any,
        clientId,
      });

      res.json({
        success: true,
        data: projects,
        count: projects.length,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/v1/projects/:id
   * Retrieve a single project with all relations.
   */
  async getById(req: Request<{ id: string }>, res: Response, next: NextFunction) {
    try {
      const project = await projectsService.findById(req.params.id);

      res.json({
        success: true,
        data: project,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/v1/projects
   * Create a new solar project.
   */
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const project = await projectsService.create(req.body);

      res.status(201).json({
        success: true,
        data: project,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * PATCH /api/v1/projects/:id/status
   * Update the status of a project.
   */
  async updateStatus(req: Request<{ id: string }>, res: Response, next: NextFunction) {
    try {
      const project = await projectsService.updateStatus(
        req.params.id,
        req.body.status
      );

      res.json({
        success: true,
        data: project,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * PUT /api/v1/projects/:id
   * Full update of a project.
   */
  async update(req: Request<{ id: string }>, res: Response, next: NextFunction) {
    try {
      const project = await projectsService.update(req.params.id, req.body);

      res.json({
        success: true,
        data: project,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * DELETE /api/v1/projects/:id
   * Delete a project and all related data.
   */
  async delete(req: Request<{ id: string }>, res: Response, next: NextFunction) {
    try {
      await projectsService.delete(req.params.id);

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },
};
