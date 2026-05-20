import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma";
import { env } from "../config/env";
import { UserRole, User } from "@prisma/client";

export const authService = {
  /**
   * Register a new user in the system.
   */
  async register(data: {
    name: string;
    email: string;
    password: string;
    role?: UserRole;
  }): Promise<Omit<User, "passwordHash">> {
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase() },
    });

    if (existingUser) {
      throw new Error("Ein Benutzer mit dieser E-Mail existiert bereits.");
    }

    const passwordHash = await bcrypt.hash(data.password, 10);

    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email.toLowerCase(),
        passwordHash,
        role: data.role || UserRole.VIEWER,
      },
    });

    const { passwordHash: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  },

  /**
   * Log in a user and return a signed JWT token.
   */
  async login(data: {
    email: string;
    password: string;
  }): Promise<{ token: string; user: Omit<User, "passwordHash"> }> {
    const user = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase() },
    });

    if (!user) {
      throw new Error("Ungueltige E-Mail-Adresse oder Passwort.");
    }

    const isPasswordValid = await bcrypt.compare(data.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new Error("Ungueltige E-Mail-Adresse oder Passwort.");
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
      },
      env.JWT_SECRET,
      { expiresIn: env.JWT_EXPIRES_IN as any }
    );

    const { passwordHash: _, ...userWithoutPassword } = user;
    return { token, user: userWithoutPassword };
  },

  /**
   * Get user details by ID.
   */
  async getUserById(id: string): Promise<Omit<User, "passwordHash"> | null> {
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) return null;

    const { passwordHash: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  },
};
