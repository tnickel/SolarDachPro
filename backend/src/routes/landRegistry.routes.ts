import { Router } from "express";
import { z } from "zod";
import { landRegistryController } from "../controllers/landRegistry.controller";
import { validate } from "../middleware/validate";

const router = Router();

// ---- Validation Schemas ----

const legalStatusEnum = z.enum([
  "PENDING",
  "IN_REVIEW",
  "APPROVED",
  "REJECTED",
  "REQUIRES_CLARIFICATION",
]);

const createLandRegistrySchema = z.object({
  gemarkung: z.string().min(1, "Gemarkung is required").max(255),
  flurstueck: z.string().min(1, "Flurstück is required").max(100),
  ownerName: z.string().min(1, "Owner name is required").max(255),
  ownerAddress: z.string().max(500).optional(),
  legalStatus: legalStatusEnum.optional().default("PENDING"),
  legalNotes: z.string().max(2000).optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  projectId: z.string().uuid("Invalid project ID"),
});

const updateLandRegistrySchema = createLandRegistrySchema.partial();

/**
 * Schema for the dedicated status update endpoint.
 * Allows updating legal status and adding review notes in one call.
 */
const updateStatusSchema = z.object({
  legalStatus: legalStatusEnum,
  legalNotes: z.string().max(2000).optional(),
});

const idParamSchema = z.object({
  id: z.string().uuid("Invalid ID format"),
});

// ---- Routes ----

router.get("/", landRegistryController.list);

router.get(
  "/:id",
  validate({ params: idParamSchema }),
  landRegistryController.getById
);

router.post(
  "/",
  validate({ body: createLandRegistrySchema }),
  landRegistryController.create
);

/**
 * PATCH /api/v1/land-registry/:id/status
 *
 * Primary endpoint for tracking the legal review workflow:
 *   PENDING → IN_REVIEW → APPROVED / REJECTED / REQUIRES_CLARIFICATION
 *
 * Example request body:
 * {
 *   "legalStatus": "APPROVED",
 *   "legalNotes": "Grundbuchauszug liegt vor, keine Belastungen"
 * }
 */
router.patch(
  "/:id/status",
  validate({ params: idParamSchema, body: updateStatusSchema }),
  landRegistryController.updateStatus
);

router.put(
  "/:id",
  validate({ params: idParamSchema, body: updateLandRegistrySchema }),
  landRegistryController.update
);

router.delete(
  "/:id",
  validate({ params: idParamSchema }),
  landRegistryController.delete
);

export default router;
