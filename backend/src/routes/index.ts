import { Router } from "express";
import clientsRoutes from "./clients.routes";
import projectsRoutes from "./projects.routes";
import landRegistryRoutes from "./landRegistry.routes";
import authRoutes from "./auth.routes";
import { authenticate, authorize } from "../middleware/auth";
import { UserRole } from "@prisma/client";

/**
 * Route aggregator – mounts all domain routes under /api/v1.
 */
const router = Router();

// 1. Public Auth Routes (Login, Register)
router.use("/auth", authRoutes);

// 2. Protect all subsequent routes – require valid JWT
router.use(authenticate);

// 3. Centralized Authorization: Write operations require ADMIN role
router.use((req, res, next) => {
  if (["POST", "PUT", "PATCH", "DELETE"].includes(req.method)) {
    return authorize(UserRole.ADMIN)(req, res, next);
  }
  next();
});

// 4. Domain Routes
router.use("/clients", clientsRoutes);
router.use("/projects", projectsRoutes);
router.use("/land-registry", landRegistryRoutes);

export default router;
