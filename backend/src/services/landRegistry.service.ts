import { prisma } from "../lib/prisma";
import { Prisma, LegalReviewStatus } from "@prisma/client";
import { NotFoundError } from "../middleware/errorHandler";

/**
 * Service layer for LandRegistry (Grundbuch) operations.
 */
export const landRegistryService = {
  /**
   * Retrieve all land registry entries with optional filters.
   */
  async findAll(filters?: {
    legalStatus?: LegalReviewStatus;
    projectId?: string;
  }) {
    const where: Prisma.LandRegistryWhereInput = {};

    if (filters?.legalStatus) {
      where.legalStatus = filters.legalStatus;
    }
    if (filters?.projectId) {
      where.projectId = filters.projectId;
    }

    return prisma.landRegistry.findMany({
      where,
      include: {
        project: {
          select: {
            id: true,
            projectName: true,
            status: true,
            client: {
              select: {
                id: true,
                companyName: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  },

  /**
   * Retrieve a single land registry entry by ID.
   */
  async findById(id: string) {
    const entry = await prisma.landRegistry.findUnique({
      where: { id },
      include: {
        project: {
          include: {
            client: true,
          },
        },
      },
    });

    if (!entry) {
      throw new NotFoundError("LandRegistry", id);
    }

    return entry;
  },

  /**
   * Create a new land registry entry linked to a project.
   */
  async create(
    data: Omit<Prisma.LandRegistryUncheckedCreateInput, "id" | "createdAt" | "updatedAt">
  ) {
    return prisma.landRegistry.create({
      data,
      include: {
        project: {
          select: {
            id: true,
            projectName: true,
          },
        },
      },
    });
  },

  /**
   * Update the legal review status of a land registry entry.
   * This is the primary use case: tracking the legal review process.
   */
  async updateStatus(
    id: string,
    legalStatus: LegalReviewStatus,
    legalNotes?: string
  ) {
    await this.findById(id);

    return prisma.landRegistry.update({
      where: { id },
      data: {
        legalStatus,
        ...(legalNotes !== undefined && { legalNotes }),
        lastCheckedAt: new Date(),
      },
      include: {
        project: {
          select: {
            id: true,
            projectName: true,
          },
        },
      },
    });
  },

  /**
   * Full update of a land registry entry.
   */
  async update(id: string, data: Prisma.LandRegistryUncheckedUpdateInput) {
    await this.findById(id);

    return prisma.landRegistry.update({
      where: { id },
      data,
    });
  },

  /**
   * Delete a land registry entry.
   */
  async delete(id: string) {
    await this.findById(id);

    return prisma.landRegistry.delete({
      where: { id },
    });
  },
};
