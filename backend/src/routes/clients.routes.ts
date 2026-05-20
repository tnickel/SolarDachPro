import { Router } from "express";
import { z } from "zod";
import { clientsController } from "../controllers/clients.controller";
import { validate } from "../middleware/validate";

const router = Router();

// ---- Validation Schemas ----

const createClientSchema = z.object({
  companyName: z.string().min(1, "Company name is required").max(255),
  contactPerson: z.string().min(1, "Contact person is required").max(255),
  email: z.string().email("Invalid email address"),
  phone: z.string().max(50).optional(),
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  postalCode: z.string().min(1, "Postal code is required").max(10),
  taxId: z.string().max(50).optional(),
});

const updateClientSchema = createClientSchema.partial();

const idParamSchema = z.object({
  id: z.string().uuid("Invalid ID format"),
});

// ---- Routes ----

router.get("/", clientsController.list);

router.get(
  "/:id",
  validate({ params: idParamSchema }),
  clientsController.getById
);

router.post(
  "/",
  validate({ body: createClientSchema }),
  clientsController.create
);

router.put(
  "/:id",
  validate({ params: idParamSchema, body: updateClientSchema }),
  clientsController.update
);

router.delete(
  "/:id",
  validate({ params: idParamSchema }),
  clientsController.delete
);

export default router;
