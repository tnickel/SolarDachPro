import { Request, Response, NextFunction } from "express";
import { authService } from "../services/auth.service";

export const authController = {
  /**
   * POST /api/v1/auth/register
   * Register a new user.
   */
  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await authService.register(req.body);
      res.status(201).json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/v1/auth/login
   * Authenticate a user and return a JWT.
   */
  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { token, user } = await authService.login(req.body);
      res.json({
        success: true,
        data: {
          token,
          user,
        },
      });
    } catch (error) {
      // Send 401 for authentication failures
      res.status(401).json({
        success: false,
        error: {
          message: error instanceof Error ? error.message : "Ungueltige Anmeldedaten",
        },
      });
    }
  },

  /**
   * GET /api/v1/auth/me
   * Retrieve current user profile.
   */
  async me(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: {
            message: "Nicht authentifiziert",
          },
        });
        return;
      }

      const user = await authService.getUserById(req.user.id);
      if (!user) {
        res.status(404).json({
          success: false,
          error: {
            message: "Benutzer nicht gefunden",
          },
        });
        return;
      }

      res.json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  },
};
