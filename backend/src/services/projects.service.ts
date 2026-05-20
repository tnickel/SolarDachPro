import { prisma } from "../lib/prisma";
import { Prisma, ProjectStatus } from "@prisma/client";
import { NotFoundError } from "../middleware/errorHandler";

/**
 * Service layer for SolarProject operations.
 */
export const projectsService = {
  /**
   * Retrieve all projects with optional status filter.
   */
  async findAll(filters?: { status?: ProjectStatus; clientId?: string }) {
    const where: Prisma.SolarProjectWhereInput = {};

    if (filters?.status) {
      where.status = filters.status;
    }
    if (filters?.clientId) {
      where.clientId = filters.clientId;
    }

    return prisma.solarProject.findMany({
      where,
      include: {
        client: {
          select: {
            id: true,
            companyName: true,
            contactPerson: true,
          },
        },
        landRegistries: {
          select: {
            id: true,
            gemarkung: true,
            flurstueck: true,
            legalStatus: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  },

  /**
   * Retrieve a single project by ID with full relations.
   */
  async findById(id: string) {
    const project = await prisma.solarProject.findUnique({
      where: { id },
      include: {
        client: true,
        landRegistries: true,
      },
    });

    if (!project) {
      throw new NotFoundError("SolarProject", id);
    }

    return project;
  },

  /**
   * Create a new solar project linked to a client.
   */
  async create(
    data: Omit<Prisma.SolarProjectUncheckedCreateInput, "id" | "createdAt" | "updatedAt">
  ) {
    return prisma.solarProject.create({
      data,
      include: {
        client: {
          select: {
            id: true,
            companyName: true,
          },
        },
      },
    });
  },

  /**
   * Update project status (dedicated endpoint for status transitions).
   */
  async updateStatus(id: string, status: ProjectStatus) {
    await this.findById(id);

    return prisma.solarProject.update({
      where: { id },
      data: { status },
    });
  },

  /**
   * Full update of a project.
   */
  async update(id: string, data: Prisma.SolarProjectUncheckedUpdateInput) {
    await this.findById(id);

    return prisma.solarProject.update({
      where: { id },
      data,
    });
  },

  /**
   * Delete a project and all related land registry entries (cascade).
   */
  async delete(id: string) {
    await this.findById(id);

    return prisma.solarProject.delete({
      where: { id },
    });
  },
};
