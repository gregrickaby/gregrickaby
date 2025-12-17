import type { IconType } from "react-icons";
import {
  FaCcPaypal,
  FaCcVisa,
  FaCoffee,
  FaEnvelope,
  FaGithubSquare,
  FaGoodreads,
  FaLinkedin,
  FaWpforms,
  FaFlickr,
  FaYoutube,
} from "react-icons/fa";

type IconMap = Record<string, IconType>;

const iconMap: IconMap = {
  FaPaypal: FaCcPaypal,
  FaVenmo: FaCcVisa,
  FaCoffee,
  FaGithubSquare,
  FaGoodreads,
  FaLinkedin,
  FaWpforms,
  FaFlickr,
  FaYoutube,
  FaEnvelope,
};

export function getIcon(iconName: string): IconType | null {
  return iconMap[iconName] || null;
}
