export type DoctorNavIcon =
  | "home"
  | "search"
  | "cat"
  | "favorites"
  | "profile"
  | "protocols"
  | "drugs"
  | "scores"
  | "offline"
  | "recents";

export type DoctorNavItem = {
  href: string;
  label: string;
  icon: DoctorNavIcon;
};

export const PRIMARY_NAV: DoctorNavItem[] = [
  { href: "/home", label: "Accueil", icon: "home" },
  { href: "/search", label: "Recherche", icon: "search" },
  { href: "/cat", label: "CAT", icon: "cat" },
  { href: "/favorites", label: "Favoris", icon: "favorites" },
  { href: "/profile", label: "Profil", icon: "profile" },
];

export const MODULE_NAV: DoctorNavItem[] = [
  { href: "/protocols", label: "Protocoles", icon: "protocols" },
  { href: "/drugs", label: "Médicaments", icon: "drugs" },
  { href: "/calculators", label: "Scores", icon: "scores" },
  { href: "/offline", label: "Hors-ligne", icon: "offline" },
  { href: "/history", label: "Récents", icon: "recents" },
];

export const DOCTOR_NAV: DoctorNavItem[] = [...PRIMARY_NAV, ...MODULE_NAV];

export function isDoctorNavActive(pathname: string, href: string) {
  if (href === "/home") {
    return pathname === "/home";
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}
