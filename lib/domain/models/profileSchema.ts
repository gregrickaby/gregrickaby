import { z } from "zod";

const urlSchema = z.string().regex(/^(https?|mailto|tel):.+/);
const urlOrPathSchema = z.string().regex(/^(https?|mailto|tel|\/)/);

export const ProfileSchema = z.object({
  name: z.string().min(1),
  siteTitle: z.string().min(1),
  bio: z.string(),
  url: urlSchema,
  company: z.object({
    name: z.string().min(1),
    role: z.string().min(1),
    url: urlSchema,
  }),
  location: z.string(),
  pronouns: z.string(),
});

export const LinkSchema = z.object({
  title: z.string().min(1),
  url: urlOrPathSchema,
  description: z.string(),
});

const IconLinkBaseSchema = z.object({
  name: z.string().min(1),
  url: urlSchema,
  icon: z.string().min(1),
});

export const SocialLinkSchema = IconLinkBaseSchema;
export const PaymentLinkSchema = IconLinkBaseSchema;
export const ContactMethodSchema = IconLinkBaseSchema;

export const ProfileDataSchema = z.object({
  profile: ProfileSchema,
  links: z.array(LinkSchema),
  contact: z.array(ContactMethodSchema),
  payment: z.array(PaymentLinkSchema),
  social: z.array(SocialLinkSchema),
});

export type Profile = z.infer<typeof ProfileSchema>;
export type Link = z.infer<typeof LinkSchema>;
export type SocialLink = z.infer<typeof SocialLinkSchema>;
export type PaymentLink = z.infer<typeof PaymentLinkSchema>;
export type ContactMethod = z.infer<typeof ContactMethodSchema>;
export type ProfileData = z.infer<typeof ProfileDataSchema>;
