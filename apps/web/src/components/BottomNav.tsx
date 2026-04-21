"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { User, Package, Wrench } from "lucide-react";

const navItems = [
  { href: "/profile/me", label: "Perfil", icon: User },
  { href: "/stock", label: "Estoque", icon: Package },
  { href: "/equipment", label: "Equipamentos", icon: Wrench },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Menu principal"
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 rounded-full border border-border bg-background/80 px-4 py-2 shadow-lg backdrop-blur-md"
    >
      {navItems.map(({ href, label, icon: Icon }) => {
        const isActive =
          href === "/profile/me"
            ? pathname === "/profile/me" || pathname.startsWith("/profile/")
            : pathname === href;
        return (
          <Link
            key={href}
            href={href}
            aria-label={label}
            className={`relative group flex items-center justify-center rounded-full p-2.5 transition-colors ${
              isActive
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            }`}
          >
            <Icon size={20} aria-hidden="true" />
            <span className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-popover px-2 py-1 text-xs text-popover-foreground shadow-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              {label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
