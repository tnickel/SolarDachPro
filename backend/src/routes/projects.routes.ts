import { Router } from "express";
import { z } from "zod";
import { projectsController } from "../controllers/projects.controller";
import { validate } from "../middleware/validate";

const router = Router();

// ---- Validation Schemas ----

const projectStatusEnum = z.enum([
  "PLANNING",
  "APPROVED",
  "UNDER_CONSTRUCTION",
  "COMMISSIONED",
  "OPERATIONAL",
  "DECOMMISSIONED",
]);

const roofTypeEnum = z.enum([
  "FLAT",
  "PITCHED",
  "SAWTOOTH",
  "METAL_SHEET",
  "OTHER",
]);

const createProjectSchema = z.object({
  projectName: z.string().min(1, "Project name is required").max(255),
  status: projectStatusEnum.optional().default("PLANNING"),
  plannedKwp: z.number().positive("kWp must be positive"),
  estimatedYieldKwh: z.number().positive().optional(),
  roofType: roofTypeEnum.optional().default("OTHER"),
  roofAreaSqm: z.number().positive().optional(),
  plannedStartDate: z.string().datetime().optional(),
  commissioningDate: z.string().datetime().optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  clientId: z.string().uuid("Invalid client ID"),
});

const updateProjectSchema = createProjectSchema.partial();

const updateStatusSchema = z.object({
  status: projectStatusEnum,
});

const idParamSchema = z.object({
  id: z.string().uuid("Invalid ID format"),
});

// ---- Routes ----

router.get("/", projectsController.list);

router.get(
  "/:id",
  validate({ params: idParamSchema }),
  projectsController.getById
);

router.post(
  "/",
  validate({ body: createProjectSchema }),
  projectsController.create
);

router.patch(
  "/:id/status",
  validate({ params: idParamSchema, body: updateStatusSchema }),
  projectsController.updateStatus
);

router.put(
  "/:id",
  validate({ params: idParamSchema, body: updateProjectSchema }),
  projectsController.update
);

router.delete(
  "/:id",
  validate({ params: idParamSchema }),
  projectsController.delete
);

export default router;
