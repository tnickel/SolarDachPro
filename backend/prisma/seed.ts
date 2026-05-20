import { PrismaClient, ProjectStatus, LegalReviewStatus, RoofType, UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

/**
 * Seed-Skript: Erzeugt realistische Demo-Daten für das Solar-as-a-Service Dashboard.
 *
 * 5 Gewerbekunden mit insgesamt ~12 Solarprojekten und zugehörigen Grundbucheinträgen.
 * Geo-Koordinaten zeigen auf reale Gewerbegebiete in Deutschland.
 */
async function main() {
  console.log("🌱 Seeding database...\n");

  // Clean existing data (in correct order due to foreign keys)
  await prisma.user.deleteMany();
  await prisma.landRegistry.deleteMany();
  await prisma.solarProject.deleteMany();
  await prisma.commercialClient.deleteMany();

  // Create Users
  const adminPasswordHash = await bcrypt.hash("admin12345", 10);
  const viewerPasswordHash = await bcrypt.hash("viewer12345", 10);

  await prisma.user.createMany({
    data: [
      {
        name: "Max Admin",
        email: "admin@solardachpro.de",
        passwordHash: adminPasswordHash,
        role: UserRole.ADMIN,
      },
      {
        name: "Anna Viewer",
        email: "viewer@solardachpro.de",
        passwordHash: viewerPasswordHash,
        role: UserRole.VIEWER,
      },
    ],
  });
  console.log("✅ 2 Demo-Benutzer angelegt");


  // ──────────────────────────────────────────────
  // Client 1: Müller Logistik GmbH (Hamburg)
  // ──────────────────────────────────────────────
  const muellerLogistik = await prisma.commercialClient.create({
    data: {
      companyName: "Müller Logistik GmbH",
      contactPerson: "Dr. Thomas Müller",
      email: "t.mueller@mueller-logistik.de",
      phone: "+49 40 123 456 78",
      address: "Alsterweg 42",
      city: "Hamburg",
      postalCode: "20095",
      taxId: "DE123456789",
      projects: {
        create: [
          {
            projectName: "Lagerhalle Süd – Dachanlage",
            status: ProjectStatus.OPERATIONAL,
            plannedKwp: 450,
            estimatedYieldKwh: 405000,
            roofType: RoofType.FLAT,
            roofAreaSqm: 3200,
            plannedStartDate: new Date("2024-03-01"),
            commissioningDate: new Date("2024-09-15"),
            latitude: 53.5511,
            longitude: 9.9937,
            landRegistries: {
              create: [
                {
                  gemarkung: "Hamburg-Wilhelmsburg",
                  flurstueck: "1234/56",
                  ownerName: "Müller Logistik GmbH",
                  ownerAddress: "Alsterweg 42, 20095 Hamburg",
                  legalStatus: LegalReviewStatus.APPROVED,
                  legalNotes: "Grundbuchauszug liegt vor. Keine Belastungen. Dachpachtvertrag bis 2044.",
                  lastCheckedAt: new Date("2024-02-20"),
                  latitude: 53.5511,
                  longitude: 9.9937,
                },
              ],
            },
          },
          {
            projectName: "Verwaltungsgebäude – Fassadenanlage",
            status: ProjectStatus.PLANNING,
            plannedKwp: 85,
            estimatedYieldKwh: 72000,
            roofType: RoofType.PITCHED,
            roofAreaSqm: 600,
            latitude: 53.5525,
            longitude: 9.9950,
            landRegistries: {
              create: [
                {
                  gemarkung: "Hamburg-Wilhelmsburg",
                  flurstueck: "1234/57",
                  ownerName: "Müller Logistik GmbH",
                  ownerAddress: "Alsterweg 42, 20095 Hamburg",
                  legalStatus: LegalReviewStatus.PENDING,
                  latitude: 53.5525,
                  longitude: 9.9950,
                },
              ],
            },
          },
        ],
      },
    },
  });
  console.log(`✅ ${muellerLogistik.companyName} – 2 Projekte`);

  // ──────────────────────────────────────────────
  // Client 2: AutoParts Weber AG (München)
  // ──────────────────────────────────────────────
  const autoPartsWeber = await prisma.commercialClient.create({
    data: {
      companyName: "AutoParts Weber AG",
      contactPerson: "Sandra Weber",
      email: "s.weber@autoparts-weber.de",
      phone: "+49 89 987 654 32",
      address: "Industriestraße 15",
      city: "München",
      postalCode: "80939",
      taxId: "DE987654321",
      projects: {
        create: [
          {
            projectName: "Produktionshalle A – Solarcarport",
            status: ProjectStatus.UNDER_CONSTRUCTION,
            plannedKwp: 320,
            estimatedYieldKwh: 336000,
            roofType: RoofType.METAL_SHEET,
            roofAreaSqm: 2400,
            plannedStartDate: new Date("2025-06-01"),
            latitude: 48.1936,
            longitude: 11.5861,
            landRegistries: {
              create: [
                {
                  gemarkung: "München-Freimann",
                  flurstueck: "789/12",
                  ownerName: "AutoParts Weber AG",
                  ownerAddress: "Industriestraße 15, 80939 München",
                  legalStatus: LegalReviewStatus.APPROVED,
                  legalNotes: "Baugenehmigung erteilt. Statik-Gutachten positiv.",
                  lastCheckedAt: new Date("2025-04-10"),
                  latitude: 48.1936,
                  longitude: 11.5861,
                },
              ],
            },
          },
          {
            projectName: "Produktionshalle B – Dachanlage",
            status: ProjectStatus.APPROVED,
            plannedKwp: 550,
            estimatedYieldKwh: 577500,
            roofType: RoofType.FLAT,
            roofAreaSqm: 4000,
            plannedStartDate: new Date("2025-09-01"),
            latitude: 48.1940,
            longitude: 11.5870,
            landRegistries: {
              create: [
                {
                  gemarkung: "München-Freimann",
                  flurstueck: "789/13",
                  ownerName: "AutoParts Weber AG",
                  ownerAddress: "Industriestraße 15, 80939 München",
                  legalStatus: LegalReviewStatus.IN_REVIEW,
                  legalNotes: "Grunddienstbarkeit wird geprüft.",
                  lastCheckedAt: new Date("2025-05-01"),
                  latitude: 48.1940,
                  longitude: 11.5870,
                },
              ],
            },
          },
          {
            projectName: "Parkplatz West – Agri-PV Pilotprojekt",
            status: ProjectStatus.PLANNING,
            plannedKwp: 180,
            roofType: RoofType.OTHER,
            roofAreaSqm: 1500,
            latitude: 48.1930,
            longitude: 11.5850,
            landRegistries: {
              create: [
                {
                  gemarkung: "München-Freimann",
                  flurstueck: "789/14",
                  ownerName: "Stadtwerke München",
                  ownerAddress: "Emmy-Noether-Str. 2, 80992 München",
                  legalStatus: LegalReviewStatus.REQUIRES_CLARIFICATION,
                  legalNotes: "Klärung der Nutzungsrechte mit Stadtwerken erforderlich.",
                  latitude: 48.1930,
                  longitude: 11.5850,
                },
              ],
            },
          },
        ],
      },
    },
  });
  console.log(`✅ ${autoPartsWeber.companyName} – 3 Projekte`);

  // ──────────────────────────────────────────────
  // Client 3: BioMarkt Schuster KG (Berlin)
  // ──────────────────────────────────────────────
  const bioMarkt = await prisma.commercialClient.create({
    data: {
      companyName: "BioMarkt Schuster KG",
      contactPerson: "Martin Schuster",
      email: "m.schuster@biomarkt-schuster.de",
      phone: "+49 30 555 123 45",
      address: "Prenzlauer Allee 88",
      city: "Berlin",
      postalCode: "10405",
      taxId: "DE456789123",
      projects: {
        create: [
          {
            projectName: "Zentrallager Spandau – Dachanlage",
            status: ProjectStatus.COMMISSIONED,
            plannedKwp: 280,
            estimatedYieldKwh: 252000,
            roofType: RoofType.FLAT,
            roofAreaSqm: 2100,
            plannedStartDate: new Date("2025-01-15"),
            commissioningDate: new Date("2025-07-30"),
            latitude: 52.5340,
            longitude: 13.1978,
            landRegistries: {
              create: [
                {
                  gemarkung: "Berlin-Spandau",
                  flurstueck: "456/78",
                  ownerName: "Gewerbepark Spandau GmbH",
                  ownerAddress: "Seeburger Str. 20, 13581 Berlin",
                  legalStatus: LegalReviewStatus.APPROVED,
                  legalNotes: "Unterpachtvertrag genehmigt durch Grundstückseigentümer.",
                  lastCheckedAt: new Date("2024-12-01"),
                  latitude: 52.5340,
                  longitude: 13.1978,
                },
                {
                  gemarkung: "Berlin-Spandau",
                  flurstueck: "456/79",
                  ownerName: "Gewerbepark Spandau GmbH",
                  ownerAddress: "Seeburger Str. 20, 13581 Berlin",
                  legalStatus: LegalReviewStatus.APPROVED,
                  legalNotes: "Angrenzende Parzelle mitgepachtet.",
                  lastCheckedAt: new Date("2024-12-01"),
                  latitude: 52.5342,
                  longitude: 13.1980,
                },
              ],
            },
          },
          {
            projectName: "Filiale Kreuzberg – Vordach-PV",
            status: ProjectStatus.PLANNING,
            plannedKwp: 45,
            estimatedYieldKwh: 38000,
            roofType: RoofType.PITCHED,
            roofAreaSqm: 350,
            latitude: 52.4990,
            longitude: 13.4030,
            landRegistries: {
              create: [
                {
                  gemarkung: "Berlin-Kreuzberg",
                  flurstueck: "102/3",
                  ownerName: "Privat – Frieda Schönberg",
                  ownerAddress: "Oranienstr. 55, 10969 Berlin",
                  legalStatus: LegalReviewStatus.IN_REVIEW,
                  legalNotes: "Eigentümerin prinzipiell einverstanden, Vertragsentwurf in Prüfung.",
                  latitude: 52.4990,
                  longitude: 13.4030,
                },
              ],
            },
          },
        ],
      },
    },
  });
  console.log(`✅ ${bioMarkt.companyName} – 2 Projekte`);

  // ──────────────────────────────────────────────
  // Client 4: TechnoStahl GmbH & Co. KG (Stuttgart)
  // ──────────────────────────────────────────────
  const technoStahl = await prisma.commercialClient.create({
    data: {
      companyName: "TechnoStahl GmbH & Co. KG",
      contactPerson: "Ingrid Hoffmann",
      email: "i.hoffmann@technostahl.de",
      phone: "+49 711 432 876 00",
      address: "Neckartalstraße 200",
      city: "Stuttgart",
      postalCode: "70376",
      taxId: "DE321654987",
      projects: {
        create: [
          {
            projectName: "Walzwerk Halle 3 – Großflächenanlage",
            status: ProjectStatus.OPERATIONAL,
            plannedKwp: 980,
            estimatedYieldKwh: 930000,
            roofType: RoofType.SAWTOOTH,
            roofAreaSqm: 7200,
            plannedStartDate: new Date("2023-04-01"),
            commissioningDate: new Date("2023-12-20"),
            latitude: 48.8082,
            longitude: 9.2200,
            landRegistries: {
              create: [
                {
                  gemarkung: "Stuttgart-Münster",
                  flurstueck: "3001/1",
                  ownerName: "TechnoStahl GmbH & Co. KG",
                  ownerAddress: "Neckartalstraße 200, 70376 Stuttgart",
                  legalStatus: LegalReviewStatus.APPROVED,
                  legalNotes: "Eigentum bestätigt. EEG-Anmeldung abgeschlossen.",
                  lastCheckedAt: new Date("2023-03-15"),
                  latitude: 48.8082,
                  longitude: 9.2200,
                },
                {
                  gemarkung: "Stuttgart-Münster",
                  flurstueck: "3001/2",
                  ownerName: "TechnoStahl GmbH & Co. KG",
                  ownerAddress: "Neckartalstraße 200, 70376 Stuttgart",
                  legalStatus: LegalReviewStatus.APPROVED,
                  legalNotes: "Erweiterungsfläche, Grundbuch sauber.",
                  lastCheckedAt: new Date("2023-03-15"),
                  latitude: 48.8085,
                  longitude: 9.2210,
                },
              ],
            },
          },
          {
            projectName: "Bürogebäude – Fassade Süd",
            status: ProjectStatus.DECOMMISSIONED,
            plannedKwp: 60,
            estimatedYieldKwh: 48000,
            roofType: RoofType.OTHER,
            roofAreaSqm: 400,
            plannedStartDate: new Date("2018-06-01"),
            commissioningDate: new Date("2018-10-01"),
            latitude: 48.8078,
            longitude: 9.2195,
            landRegistries: {
              create: [
                {
                  gemarkung: "Stuttgart-Münster",
                  flurstueck: "3002/1",
                  ownerName: "TechnoStahl GmbH & Co. KG",
                  ownerAddress: "Neckartalstraße 200, 70376 Stuttgart",
                  legalStatus: LegalReviewStatus.APPROVED,
                  legalNotes: "Altanlage, Rückbau 2025 abgeschlossen.",
                  lastCheckedAt: new Date("2025-03-01"),
                  latitude: 48.8078,
                  longitude: 9.2195,
                },
              ],
            },
          },
        ],
      },
    },
  });
  console.log(`✅ ${technoStahl.companyName} – 2 Projekte`);

  // ──────────────────────────────────────────────
  // Client 5: Getränke Krause OHG (Frankfurt)
  // ──────────────────────────────────────────────
  const getraenkeKrause = await prisma.commercialClient.create({
    data: {
      companyName: "Getränke Krause OHG",
      contactPerson: "Peter Krause",
      email: "p.krause@getraenke-krause.de",
      phone: "+49 69 777 888 99",
      address: "Am Industriehof 8",
      city: "Frankfurt am Main",
      postalCode: "60487",
      projects: {
        create: [
          {
            projectName: "Kühlhaus – Dachanlage mit Eigenverbrauch",
            status: ProjectStatus.APPROVED,
            plannedKwp: 200,
            estimatedYieldKwh: 190000,
            roofType: RoofType.FLAT,
            roofAreaSqm: 1600,
            plannedStartDate: new Date("2026-01-15"),
            latitude: 50.1205,
            longitude: 8.6365,
            landRegistries: {
              create: [
                {
                  gemarkung: "Frankfurt-Bockenheim",
                  flurstueck: "567/23",
                  ownerName: "Immobilien Fuchs GbR",
                  ownerAddress: "Leipziger Str. 12, 60487 Frankfurt",
                  legalStatus: LegalReviewStatus.REJECTED,
                  legalNotes: "Dachpacht abgelehnt: Eigentümer plant eigenen Ausbau. Neuverhandlung läuft.",
                  lastCheckedAt: new Date("2025-11-20"),
                  latitude: 50.1205,
                  longitude: 8.6365,
                },
              ],
            },
          },
          {
            projectName: "Auslieferungslager Nord – Carport",
            status: ProjectStatus.PLANNING,
            plannedKwp: 120,
            roofType: RoofType.METAL_SHEET,
            roofAreaSqm: 900,
            latitude: 50.1350,
            longitude: 8.6820,
            landRegistries: {
              create: [
                {
                  gemarkung: "Frankfurt-Fechenheim",
                  flurstueck: "890/4",
                  ownerName: "Getränke Krause OHG",
                  ownerAddress: "Am Industriehof 8, 60487 Frankfurt",
                  legalStatus: LegalReviewStatus.PENDING,
                  latitude: 50.1350,
                  longitude: 8.6820,
                },
              ],
            },
          },
          {
            projectName: "Filiale Sachsenhausen – Kleinstanlage",
            status: ProjectStatus.PLANNING,
            plannedKwp: 30,
            estimatedYieldKwh: 27000,
            roofType: RoofType.PITCHED,
            roofAreaSqm: 200,
            latitude: 50.0990,
            longitude: 8.6820,
            landRegistries: {
              create: [
                {
                  gemarkung: "Frankfurt-Sachsenhausen",
                  flurstueck: "234/11",
                  ownerName: "Privat – Klaus Berger",
                  ownerAddress: "Schweizer Str. 71, 60594 Frankfurt",
                  legalStatus: LegalReviewStatus.PENDING,
                  latitude: 50.0990,
                  longitude: 8.6820,
                },
              ],
            },
          },
        ],
      },
    },
  });
  console.log(`✅ ${getraenkeKrause.companyName} – 3 Projekte`);

  // ──────────────────────────────────────────────
  // Summary
  // ──────────────────────────────────────────────
  const clientCount = await prisma.commercialClient.count();
  const projectCount = await prisma.solarProject.count();
  const registryCount = await prisma.landRegistry.count();
  const totalKwp = await prisma.solarProject.aggregate({
    _sum: { plannedKwp: true },
  });

  console.log(`
  ────────────────────────────────────────
  🌱 Seeding complete!
  ────────────────────────────────────────
  Clients:          ${clientCount}
  Solar Projects:   ${projectCount}
  Land Registries:  ${registryCount}
  Total planned:    ${totalKwp._sum.plannedKwp} kWp
  ────────────────────────────────────────
  `);
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
