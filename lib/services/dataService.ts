import type { ProfileData } from "@/lib/domain/models/profileSchema";
import { ProfileDataSchema } from "@/lib/domain/models/profileSchema";
import rawData from "@/public/data.json";
import { cache } from "react";
import { ZodError } from "zod";

export const getProfileData = cache((): ProfileData => {
  try {
    return ProfileDataSchema.parse(rawData);
  } catch (error) {
    if (error instanceof ZodError) {
      if (process.env.NODE_ENV === "development") {
        console.error("Data validation failed:", error.issues);
      }
      throw new Error("Invalid profile data structure");
    }
    throw error;
  }
});
