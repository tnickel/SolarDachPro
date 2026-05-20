import { Request, Response, NextFunction } from "express";

/**
 * Authentication middleware stub (Phase 2).
 *
 * Currently passes all requests through without verification.
 * Will be replaced with JWT token validation in Phase 2.
 *
 * Usage:
 *   router.use(authenticate);  // Protect all routes in this router
 *   router.get("/", authenticate, controller.list);  // Protect single route
 */
export function authenticate(
  _req: Request,
  _res: Response,
  next: NextFunction
): void {
  // TODO Phase 2: Implement JWT verification
  // 1. Extract token from Authorization header (Bearer <token>)
  // 2. Verify token using env.JWT_SECRET
  // 3. Attach decoded user to req.user
  // 4. Call next() on success, or return 401 on failure
  next();
}

/**
 * Role-based authorization middleware stub (Phase 2).
 *
 * @param _roles - Allowed roles (e.g., "admin", "viewer")
 */
export function authorize(..._roles: string[]) {
  return (_req: Request, _res: Response, next: NextFunction): void => {
    // TODO Phase 2: Check if req.user.role is in allowed roles
    // Return 403 Forbidden if not authorized
    next();
  };
}
