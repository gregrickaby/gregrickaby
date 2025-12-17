import { ZodError } from "zod";
import rawData from "@/app/data.json";
import type { ProfileData } from "@/lib/domain/models/profileSchema";
import { ProfileDataSchema } from "@/lib/domain/models/profileSchema";

let cachedData: ProfileData | null = null;

export function getProfileData(): ProfileData {
  if (cachedData) {
    return cachedData;
  }

  try {
    cachedData = ProfileDataSchema.parse(rawData);
    return cachedData;
  } catch (error) {
    if (error instanceof ZodError) {
      console.error("Data validation failed:", error.issues);
      throw new Error("Invalid profile data structure");
    }
    throw error;
  }
}
