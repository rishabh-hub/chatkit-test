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
import { Menu, SquareArrowOutUpRight } from "lucide-react";
import { Button } from "./ui/button";
import Link from "next/link";
import { Separator } from "./ui/separator";
import { navigationItems } from "@/lib/constants";
import { motion } from "framer-motion";

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
          {navigationItems.map((item, index) => (
            <motion.div
              key={item.name}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: index * 0.2 }}
              className="w-full text-xl"
            >
              <div className=" flex gap-1 ps-2 items-center group hover:underline hover:text-blue-300">
                <SquareArrowOutUpRight className=" opacity-0 w-4 h-4 group-hover:opacity-100 transition-opacity duration-300 " />
                <Link className="" href={`${item.href}`}>
                  {item.name}
                </Link>
              </div>
              <Separator className=" my-3" />
            </motion.div>
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
