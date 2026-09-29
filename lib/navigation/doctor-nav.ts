export type DoctorNavIcon =
  | "home"
  | "search"
  | "favorites"
  | "profile"
  | "protocols"
  | "drugs"
  | "scores"
  | "offline"
  | "recents"
  | "modules";

export type DoctorNavItem = {
  href: string;
  label: string;
  icon: DoctorNavIcon;
};

export type MobileBottomNavModules = {
  id: "modules";
  label: string;
  icon: "modules";
};

export type MobileBottomNavEntry = DoctorNavItem | MobileBottomNavModules;

/** Desktop sidebar — primary destinations (profile stays here, not in mobile bottom nav). */
export const SIDEBAR_PRIMARY_NAV: DoctorNavItem[] = [
  { href: "/home", label: "Accueil", icon: "home" },
  { href: "/search", label: "Recherche", icon: "search" },
  { href: "/history", label: "Récents", icon: "recents" },
  { href: "/favorites", label: "Favoris", icon: "favorites" },
  { href: "/profile", label: "Profil", icon: "profile" },
];

/** Mobile bottom bar — search centered; modules opens the sheet. */
export const MOBILE_BOTTOM_NAV: MobileBottomNavEntry[] = [
  { href: "/home", label: "Accueil", icon: "home" },
  { href: "/history", label: "Récents", icon: "recents" },
  { href: "/search", label: "Recherche", icon: "search" },
  { id: "modules", label: "Modules", icon: "modules" },
  { href: "/favorites", label: "Favoris", icon: "favorites" },
];

export const MODULE_NAV: DoctorNavItem[] = [
  { href: "/protocols", label: "Protocoles", icon: "protocols" },
  { href: "/drugs", label: "Médicaments", icon: "drugs" },
  { href: "/calculators", label: "Scores", icon: "scores" },
  { href: "/offline", label: "Hors-ligne", icon: "offline" },
];

function mergeNavItems(...groups: DoctorNavItem[][]): DoctorNavItem[] {
  const seen = new Set<string>();
  const merged: DoctorNavItem[] = [];
  for (const group of groups) {
    for (const item of group) {
      if (seen.has(item.href)) {
        continue;
      }
      seen.add(item.href);
      merged.push(item);
    }
  }
  return merged;
}

export const DOCTOR_NAV: DoctorNavItem[] = mergeNavItems(
  SIDEBAR_PRIMARY_NAV,
  MODULE_NAV,
);

/** @deprecated Use SIDEBAR_PRIMARY_NAV */
export const PRIMARY_NAV = SIDEBAR_PRIMARY_NAV;

export function isDoctorNavActive(pathname: string, href: string) {
  if (href === "/home") {
    return pathname === "/home";
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function isModuleNavActive(pathname: string) {
  return MODULE_NAV.some((item) => isDoctorNavActive(pathname, item.href));
}

export function isMobileBottomNavEntry(
  entry: MobileBottomNavEntry,
): entry is DoctorNavItem {
  return "href" in entry;
}
