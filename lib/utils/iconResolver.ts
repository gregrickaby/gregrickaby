import type { IconType } from "react-icons";
import { BsFiletypeJson } from "react-icons/bs";
import { FaCoffee, FaEnvelope, FaPhone } from "react-icons/fa";
import {
  FaCcPaypal,
  FaFlickr,
  FaGoodreads,
  FaLinkedin,
  FaSquareFacebook,
  FaSquareGithub,
  FaSquareInstagram,
  FaSquareThreads,
  FaSquareYoutube,
} from "react-icons/fa6";
import { MdVerified } from "react-icons/md";
import { SiVenmo } from "react-icons/si";

const iconLibraries = {
  BsFiletypeJson,
  FaCcPaypal,
  FaCoffee,
  FaEnvelope,
  FaFacebookSquare: FaSquareFacebook,
  FaFlickr,
  FaGithubSquare: FaSquareGithub,
  FaGoodreads,
  FaInstagramSquare: FaSquareInstagram,
  FaLinkedin,
  FaPhone,
  FaSquareThreads,
  FaYoutubeSquare: FaSquareYoutube,
  MdVerified,
  SiVenmo,
} as Record<string, IconType>;

const iconAliases: Record<string, string> = {
  FaPaypal: "FaCcPaypal",
  FaVenmo: "SiVenmo",
};

export function getIcon(iconName: string): IconType | null {
  const resolvedName = iconAliases[iconName] || iconName;
  return iconLibraries[resolvedName] || null;
}
