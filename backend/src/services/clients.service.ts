import { prisma } from "../lib/prisma";
import { Prisma } from "@prisma/client";
import { NotFoundError } from "../middleware/errorHandler";

/**
 * Service layer for CommercialClient operations.
 * Encapsulates all database interactions for clients.
 */
export const clientsService = {
  /**
   * Retrieve all commercial clients with optional search.
   */
  async findAll(search?: string) {
    const where: Prisma.CommercialClientWhereInput = search
      ? {
          OR: [
            { companyName: { contains: search, mode: "insensitive" } },
            { contactPerson: { contains: search, mode: "insensitive" } },
            { email: { contains: search, mode: "insensitive" } },
          ],
        }
      : {};

    return prisma.commercialClient.findMany({
      where,
      include: {
        projects: {
          select: {
            id: true,
            projectName: true,
            status: true,
            plannedKwp: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  },

  /**
   * Retrieve a single client by ID, including all related projects.
   */
  async findById(id: string) {
    const client = await prisma.commercialClient.findUnique({
      where: { id },
      include: {
        projects: {
          include: {
            landRegistries: true,
          },
        },
      },
    });

    if (!client) {
      throw new NotFoundError("CommercialClient", id);
    }

    return client;
  },

  /**
   * Create a new commercial client.
   */
  async create(data: Prisma.CommercialClientCreateInput) {
    return prisma.commercialClient.create({ data });
  },

  /**
   * Update an existing client.
   */
  async update(id: string, data: Prisma.CommercialClientUpdateInput) {
    // Verify existence first
    await this.findById(id);

    return prisma.commercialClient.update({
      where: { id },
      data,
    });
  },

  /**
   * Delete a client and all related projects (cascade).
   */
  async delete(id: string) {
    // Verify existence first
    await this.findById(id);

    return prisma.commercialClient.delete({
      where: { id },
    });
  },
};
