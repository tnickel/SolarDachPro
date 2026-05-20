import { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError } from "zod";

/**
 * Request validation middleware using Zod schemas.
 *
 * Validates body, params, and/or query against provided schemas.
 * Returns 400 with structured validation errors on failure.
 *
 * @example
 * router.post("/", validate({ body: createClientSchema }), controller.create);
 */
export function validate(schemas: {
  body?: ZodSchema;
  params?: ZodSchema;
  query?: ZodSchema;
}) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      if (schemas.body) {
        req.body = schemas.body.parse(req.body);
      }
      if (schemas.params) {
        req.params = schemas.params.parse(req.params) as typeof req.params;
      }
      if (schemas.query) {
        req.query = schemas.query.parse(req.query) as typeof req.query;
      }
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({
          success: false,
          error: {
            message: "Validation failed",
            details: error.errors.map((e) => ({
              field: e.path.join("."),
              message: e.message,
            })),
          },
        });
        return;
      }
      next(error);
    }
  };
}
