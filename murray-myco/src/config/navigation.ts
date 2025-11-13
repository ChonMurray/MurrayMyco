export type NavItem = { label: string; href: string; description?: string };

export const NAV_SURFACE: NavItem[] = [
  { label: "Fresh mushrooms", href: "/consumer#fresh", description: "Culinary" },
  { label: "Grow kits", href: "/consumer#kits", description: "Home cultivators" },
  { label: "Dried mushrooms", href: "/consumer#dried" },
  { label: "Extracts", href: "/consumer#extracts", description: "Medicinal" },
];

export const NAV_SUBSURFACE: NavItem[] = [
  { label: "Spore prints", href: "/lab#spore-prints" },
  { label: "Liquid cultures", href: "/lab#liquid-cultures" },
  { label: "Plated mycelium", href: "/lab#plated" },
  { label: "Growth media", href: "/lab#media" },
  { label: "Inoculated substrates", href: "/lab#inoculated" },
  { label: "Pre-colonized blocks", href: "/lab#blocks" },
];

export const NAV_ROOT: NavItem[] = [
  { label: "Research", href: "/about#research" },
  { label: "Methodology", href: "/about#method" },
  { label: "Company", href: "/about#company" },
];
