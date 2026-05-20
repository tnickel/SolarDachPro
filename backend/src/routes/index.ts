import { Router } from "express";
import clientsRoutes from "./clients.routes";
import projectsRoutes from "./projects.routes";
import landRegistryRoutes from "./landRegistry.routes";

/**
 * Route aggregator – mounts all domain routes under /api/v1.
 */
const router = Router();

router.use("/clients", clientsRoutes);
router.use("/projects", projectsRoutes);
router.use("/land-registry", landRegistryRoutes);

export default router;
