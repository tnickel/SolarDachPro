-- CreateEnum
CREATE TYPE "ProjectStatus" AS ENUM ('PLANNING', 'APPROVED', 'UNDER_CONSTRUCTION', 'COMMISSIONED', 'OPERATIONAL', 'DECOMMISSIONED');

-- CreateEnum
CREATE TYPE "LegalReviewStatus" AS ENUM ('PENDING', 'IN_REVIEW', 'APPROVED', 'REJECTED', 'REQUIRES_CLARIFICATION');

-- CreateEnum
CREATE TYPE "RoofType" AS ENUM ('FLAT', 'PITCHED', 'SAWTOOTH', 'METAL_SHEET', 'OTHER');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'VIEWER');

-- CreateTable
CREATE TABLE "commercial_clients" (
    "id" TEXT NOT NULL,
    "company_name" TEXT NOT NULL,
    "contact_person" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "postal_code" TEXT NOT NULL,
    "tax_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "commercial_clients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "solar_projects" (
    "id" TEXT NOT NULL,
    "project_name" TEXT NOT NULL,
    "status" "ProjectStatus" NOT NULL DEFAULT 'PLANNING',
    "planned_kwp" DOUBLE PRECISION NOT NULL,
    "estimated_yield_kwh" DOUBLE PRECISION,
    "roof_type" "RoofType" NOT NULL DEFAULT 'OTHER',
    "roof_area_sqm" DOUBLE PRECISION,
    "planned_start_date" TIMESTAMP(3),
    "commissioning_date" TIMESTAMP(3),
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "client_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "solar_projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "land_registry" (
    "id" TEXT NOT NULL,
    "gemarkung" TEXT NOT NULL,
    "flurstueck" TEXT NOT NULL,
    "owner_name" TEXT NOT NULL,
    "owner_address" TEXT,
    "legal_status" "LegalReviewStatus" NOT NULL DEFAULT 'PENDING',
    "legal_notes" TEXT,
    "last_checked_at" TIMESTAMP(3),
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "project_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "land_registry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'VIEWER',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "commercial_clients_email_key" ON "commercial_clients"("email");

-- CreateIndex
CREATE INDEX "solar_projects_client_id_idx" ON "solar_projects"("client_id");

-- CreateIndex
CREATE INDEX "solar_projects_status_idx" ON "solar_projects"("status");

-- CreateIndex
CREATE INDEX "land_registry_project_id_idx" ON "land_registry"("project_id");

-- CreateIndex
CREATE INDEX "land_registry_legal_status_idx" ON "land_registry"("legal_status");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- AddForeignKey
ALTER TABLE "solar_projects" ADD CONSTRAINT "solar_projects_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "commercial_clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "land_registry" ADD CONSTRAINT "land_registry_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "solar_projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
