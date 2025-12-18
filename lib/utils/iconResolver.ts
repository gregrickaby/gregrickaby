import type { IconType } from "react-icons";
import * as BsIcons from "react-icons/bs";
import * as FaIcons from "react-icons/fa";
import * as Fa6Icons from "react-icons/fa6";
import * as MdIcons from "react-icons/md";
import * as RxIcons from "react-icons/rx";
import * as SiIcons from "react-icons/si";

const iconLibraries = {
  ...BsIcons,
  ...FaIcons,
  ...Fa6Icons,
  ...MdIcons,
  ...RxIcons,
  ...SiIcons,
} as Record<string, IconType>;

const iconAliases: Record<string, string> = {
  FaPaypal: "FaCcPaypal",
  FaVenmo: "SiVenmo",
};

export function getIcon(iconName: string): IconType | null {
  const resolvedName = iconAliases[iconName] || iconName;
  return iconLibraries[resolvedName] || null;
}
