import { Router } from "express";
import { z } from "zod";
import { authController } from "../controllers/auth.controller";
import { validate } from "../middleware/validate";
import { authenticate } from "../middleware/auth";
import { UserRole } from "@prisma/client";

const router = Router();

// ---- Validation Schemas ----

const registerSchema = z.object({
  name: z.string().min(1, "Name ist erforderlich").max(100),
  email: z.string().email("Ungueltige E-Mail-Adresse"),
  password: z.string().min(6, "Das Passwort muss mindestens 6 Zeichen lang sein"),
  role: z.nativeEnum(UserRole).optional(),
});

const loginSchema = z.object({
  email: z.string().email("Ungueltige E-Mail-Adresse"),
  password: z.string().min(1, "Passwort ist erforderlich"),
});

// ---- Routes ----

router.post(
  "/register",
  validate({ body: registerSchema }),
  authController.register
);

router.post(
  "/login",
  validate({ body: loginSchema }),
  authController.login
);

router.get(
  "/me",
  authenticate,
  authController.me
);

export default router;
