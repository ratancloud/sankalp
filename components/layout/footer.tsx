"use client";

import Link from "next/link";
import { Twitter, Instagram } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="hidden md:block border-t border-border/50 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="container flex flex-col items-center justify-between gap-6 py-8 md:h-24 md:flex-row md:py-0 max-w-7xl px-4 md:px-8 mx-auto">
        
        {/* 1. Copyright & Brand */}
        <div className="flex items-center gap-2 order-3 md:order-1">
          <p className="text-sm text-muted-foreground">
            &copy; {currentYear} Ratan Kumar. All rights reserved.
          </p>
        </div>

        {/* 2. Navigation Links */}
        <nav className="flex flex-wrap justify-center gap-6 order-2">
          <Link
            href="/"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground hover:underline underline-offset-4"
          >
            Home
          </Link>
          <Link
            href="/about"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground hover:underline underline-offset-4"
          >
            About
          </Link>
          <Link
            href="/contact-us"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground hover:underline underline-offset-4"
          >
            Contact
          </Link>
        </nav>

        {/* 3. Social Icons */}
        <div className="flex items-center gap-2 order-1 md:order-3">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            asChild
          >
            <Link href="#" aria-label="Twitter">
              <Twitter className="h-4 w-4" />
            </Link>
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            asChild
          >
            <Link href="#" aria-label="Instagram">
              <Instagram className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </footer>
  );
}