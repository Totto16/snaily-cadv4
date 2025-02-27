import { z } from "zod";

export const CREATE_CITIZEN_SCHEMA = z.object({
  name: z.string().min(2).max(255),
  surname: z.string().min(3).max(255),
  gender: z.string().min(2).max(255),
  ethnicity: z.string().min(2).max(255),
  dateOfBirth: z.date().or(z.string().min(2)),
  weight: z.string().min(2).max(255),
  height: z.string().min(2).max(255),
  hairColor: z.string().min(2).max(255),
  eyeColor: z.string().min(2).max(255),
  address: z.string().min(2).max(255),
  postal: z.string().max(255).nullable().optional(),
  driversLicense: z.string().max(255).nullable().optional(),
  weaponLicense: z.string().max(255).nullable().optional(),
  pilotLicense: z.string().max(255).nullable().optional(),
  waterLicense: z.string().max(255).nullable().optional(),
  phoneNumber: z.string().max(255).nullable().optional(),
  occupation: z.string().nullable().optional(),
  driversLicenseCategory: z.array(z.any()).nullable().optional(),
  pilotLicenseCategory: z.array(z.any()).nullable().optional(),
  waterLicenseCategory: z.array(z.any()).nullable().optional(),
  firearmLicenseCategory: z.array(z.any()).nullable().optional(),
  image: z.any().nullable().optional(),
});

export const TAX_STATUS_REGEX = /TAXED|UNTAXED/;
export const INSPECTION_STATUS_REGEX = /PASSED|FAILED/;

export const VEHICLE_SCHEMA = z.object({
  plate: z.string().min(2).max(255),
  model: z.string().min(2).max(255),
  color: z.string().min(2).max(255),
  registrationStatus: z.string().min(2).max(255),
  insuranceStatus: z.string().max(255).nullable(),
  taxStatus: z.string().regex(TAX_STATUS_REGEX).nullable(),
  inspectionStatus: z.string().regex(INSPECTION_STATUS_REGEX).nullable(),
  citizenId: z.string().min(2).max(255),
  vinNumber: z.string().max(17).optional(),
  reportedStolen: z.boolean().optional(),
  businessId: z.string().max(255).optional().nullable(),
  employeeId: z.string().max(255).optional().nullable(),
  reApplyForDmv: z.boolean().nullable().optional(),
});

export const DELETE_VEHICLE_SCHEMA = z.object({
  businessId: z.string().max(255).optional().nullable(),
  employeeId: z.string().max(255).optional().nullable(),
});

export const WEAPON_SCHEMA = z.object({
  model: z.string().min(2),
  registrationStatus: z.string().min(2).max(255),
  citizenId: z.string().min(2).max(255),
  serialNumber: z.string().max(10).optional(),
});

export const LICENSE_SCHEMA = CREATE_CITIZEN_SCHEMA.pick({
  driversLicense: true,
  driversLicenseCategory: true,
  pilotLicense: true,
  pilotLicenseCategory: true,
  weaponLicense: true,
  firearmLicenseCategory: true,
  waterLicense: true,
  waterLicenseCategory: true,
});

export const MEDICAL_RECORD_SCHEMA = z.object({
  type: z.string().max(255),
  description: z.string(),
  bloodGroup: z.string().max(255).nullable(),
  citizenId: z.string().min(2).max(255),
});
