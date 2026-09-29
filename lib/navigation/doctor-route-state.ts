import type { ShellFrame } from "@/lib/layout/frames";
import { DOCTOR_NAV } from "@/lib/navigation/doctor-nav";

export type DoctorNavVariant = "pill" | "text";

export type DoctorRouteState = {
  label: string;
  pageHeading: boolean;
  backHref?: string;
  frame: ShellFrame;
  navVariant: DoctorNavVariant;
  isDetail: boolean;
  hasReadingDock: boolean;
  avatarDot: boolean;
};

type IndexMeta = {
  href: string;
  label?: string;
  pageHeading: boolean;
  frame: ShellFrame;
  navVariant: DoctorNavVariant;
  avatarDot?: boolean;
};

const INDEX_ROUTES: IndexMeta[] = [
  {
    href: "/home",
    pageHeading: false,
    frame: "workspace",
    navVariant: "pill",
  },
  {
    href: "/search",
    pageHeading: true,
    frame: "workspace",
    navVariant: "text",
  },
  {
    href: "/protocols",
    pageHeading: true,
    frame: "clinical",
    navVariant: "text",
  },
  {
    href: "/drugs",
    pageHeading: true,
    frame: "clinical",
    navVariant: "text",
    avatarDot: true,
  },
  {
    href: "/calculators",
    pageHeading: true,
    frame: "clinical",
    navVariant: "text",
    avatarDot: true,
  },
  {
    href: "/favorites",
    pageHeading: true,
    frame: "workspace",
    navVariant: "text",
  },
  {
    href: "/history",
    pageHeading: true,
    frame: "workspace",
    navVariant: "text",
  },
  {
    href: "/offline",
    pageHeading: true,
    frame: "workspace",
    navVariant: "pill",
  },
  {
    href: "/profile",
    pageHeading: true,
    frame: "workspace",
    navVariant: "text",
  },
];

type DetailMeta = {
  prefix: string;
  label: string;
  backHref: string;
  frame: ShellFrame;
  hasReadingDock: boolean;
};

const DETAIL_ROUTES: DetailMeta[] = [
  {
    prefix: "/offline/view/",
    label: "Hors-ligne",
    backHref: "/offline",
    frame: "workspace",
    hasReadingDock: false,
  },
  {
    prefix: "/protocols/",
    label: "Protocoles",
    backHref: "/search?type=protocols",
    frame: "clinical",
    hasReadingDock: true,
  },
  {
    prefix: "/drugs/",
    label: "Médicaments",
    backHref: "/drugs",
    frame: "clinical",
    hasReadingDock: true,
  },
  {
    prefix: "/calculators/",
    label: "Scores",
    backHref: "/calculators",
    frame: "clinical",
    hasReadingDock: true,
  },
];

function navLabel(href: string) {
  return DOCTOR_NAV.find((item) => item.href === href)?.label ?? href;
}

function fromIndex(meta: IndexMeta): DoctorRouteState {
  return {
    label: meta.label ?? navLabel(meta.href),
    pageHeading: meta.pageHeading,
    frame: meta.frame,
    navVariant: meta.navVariant,
    isDetail: false,
    hasReadingDock: false,
    avatarDot: Boolean(meta.avatarDot),
  };
}

const FALLBACK_ROUTE: DoctorRouteState = {
  label: "Nabda",
  pageHeading: false,
  frame: "workspace",
  navVariant: "text",
  isDetail: false,
  hasReadingDock: false,
  avatarDot: false,
};

export function getDoctorRouteState(pathname: string): DoctorRouteState {
  for (const detail of DETAIL_ROUTES) {
    if (pathname.startsWith(detail.prefix)) {
      return {
        label: detail.label,
        pageHeading: false,
        backHref: detail.backHref,
        frame: detail.frame,
        navVariant: "text",
        isDetail: true,
        hasReadingDock: detail.hasReadingDock,
        avatarDot: false,
      };
    }
  }

  const exact = INDEX_ROUTES.find((item) => item.href === pathname);
  if (exact) {
    return fromIndex(exact);
  }

  const nested = INDEX_ROUTES.filter(
    (item) => item.href !== "/home" && pathname.startsWith(`${item.href}/`),
  ).sort((a, b) => b.href.length - a.href.length)[0];

  if (nested) {
    return {
      ...fromIndex(nested),
      isDetail: true,
      pageHeading: false,
      backHref: nested.href,
    };
  }

  return FALLBACK_ROUTE;
}
