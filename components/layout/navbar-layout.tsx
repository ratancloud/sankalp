"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "./Logo";
import { ModeToggle } from "./mode-toggle";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { UserMenu } from "./user-menu";
import { AUTH_NAV_ITEMS, GUEST_NAV_ITEMS } from "./nav-config";

interface NavbarLayoutProps {
  user: {
    name: string;
    email: string;
    image?: string | null;
  } | null;
}

export default function NavbarLayout({ user }: NavbarLayoutProps) {
  const pathname = usePathname();
  const isActive = (href: string) => pathname === href;

  const navItems = user ? AUTH_NAV_ITEMS : GUEST_NAV_ITEMS;

  return (
    <>
      {/* Desktop Header */}
      <header className="flex max-w-7xl mx-auto sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md px-4 md:px-8 h-16 items-center justify-between">
        <Logo />

        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all",
                isActive(link.href)
                  ? "bg-primary/10 text-primary hover:bg-primary/20"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              {link.name}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <ModeToggle />
          {user ? (
            <UserMenu user={user} />
          ) : (
            <div className="flex gap-2">
              <Button variant="ghost" asChild>
                <Link href="/login">Login</Link>
              </Button>
              <Button asChild>
                <Link href="/signup">Sign up</Link>
              </Button>
            </div>
          )}
        </div>
      </header>

      {/* Mobile Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 py-2 backdrop-blur-lg pb-safe md:hidden">
        <div
          className={cn(
            "grid h-16 items-center px-2 pb-1",
            user ? "grid-cols-5" : "grid-cols-3"
          )}
        >
          {navItems.map((link) => {
            const active = isActive(link.href);
            const Icon = link.icon; 
            return (
              <Link
                key={link.href}
                href={link.href}
                className="group flex h-full w-full flex-col items-center justify-center"
              >
                <div
                  className={cn(
                    "flex items-center justify-center rounded-full py-1 mb-1 transition-all duration-300 ease-out",
                    active
                      ? "w-16 bg-primary/15 text-primary"
                      : "w-12 bg-transparent text-muted-foreground group-hover:bg-muted/50"
                  )}
                >
                  <Icon
                    className={cn(
                      "h-6 w-6 min-h-6 min-w-6 transition-transform duration-300",
                      active ? "scale-110" : "group-active:scale-90"
                    )}
                    strokeWidth={active ? 3 : 2}
                  />
                </div>
                <span
                  className={cn(
                    "text-[10px] font-medium transition-all duration-300",
                    active
                      ? "scale-105 font-bold text-primary"
                      : "text-muted-foreground"
                  )}
                >
                  {link.name}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}