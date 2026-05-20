import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { UserRole } from "@prisma/client";

interface DecodedToken {
  id: string;
  email: string;
  role: UserRole;
  name: string;
}

/**
 * Authentication middleware.
 * Verifies JWT token and attaches user payload to req.user.
 */
export function authenticate(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({
      success: false,
      error: {
        message: "Authentifizierung erforderlich. Token fehlt oder ist ungueltig.",
      },
    });
    return;
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as DecodedToken;
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
      name: decoded.name,
    };
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      error: {
        message: "Ungueltiges oder abgelaufenes Token.",
      },
    });
  }
}

/**
 * Role-based authorization middleware.
 * Grants access only if user's role is in the allowed roles.
 */
export function authorize(...roles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: {
          message: "Nicht authentifiziert.",
        },
      });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        error: {
          message: "Keine Berechtigung fuer diese Aktion.",
        },
      });
      return;
    }

    next();
  };
}
