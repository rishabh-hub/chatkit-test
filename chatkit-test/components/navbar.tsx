import { LucideOctagon } from "lucide-react";
import { MobileNav } from "./mobile-nav";
import Link from "next/link";
import { DesktopNav } from "./desktop-nav";
import { UserNav } from "./user-nav";
import { ModeToggle } from "./mode-toggle";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className=" container flex h-16 items-center">
        <MobileNav />

        <div className="flex mr-4">
          <Link
            href={"/"}
            className=" mr-6 flex items-center space-x-2 text-amber-300  font-bold"
          >
            Company Name
            <span className="hidden font-bold ml-2 sm:inline-block">
              <LucideOctagon />
            </span>
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <DesktopNav />

          {/* Right side items */}
          <div className="flex items-center space-x-10">
            <UserNav />
            <ModeToggle />
          </div>
        </div>
      </div>
    </header>
  );
}
