"use client";
import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet";
import { Menu } from "lucide-react";
import { Button } from "./ui/button";
import Link from "next/link";
import { Separator } from "./ui/separator";
import { navigationItems } from "@/lib/constants";

export function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <Sheet>
      <SheetTrigger asChild className=" sm:hidden">
        <Button variant={"ghost"}>
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle navigation menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[300px] sm:w-[400px]" side="left">
        <SheetHeader>
          <SheetTitle>Menu</SheetTitle>
          <SheetDescription> Select page</SheetDescription>
        </SheetHeader>
        <nav>
          {navigationItems.map((item) => (
            <div className="w-full text-xl">
              <div>
                <Link
                  className=" p-4 hover:text-blue-400"
                  href={`${item.href}`}
                >
                  {item.name}
                </Link>
              </div>
              <Separator className=" my-3" />
            </div>
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
