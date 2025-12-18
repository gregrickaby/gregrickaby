import type {
  ContactMethod,
  PaymentLink,
  Profile,
  SocialLink,
} from "@/lib/domain/models/profileSchema";

export type ProfileProps = {
  profile: Profile;
  contact: ContactMethod[];
  payment: PaymentLink[];
  social: SocialLink[];
};
