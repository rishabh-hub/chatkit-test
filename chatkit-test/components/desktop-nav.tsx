import Link from "next/link";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "./ui/navigation-menu";
import { navigationItems } from "@/lib/constants";
import { Link2, SquareArrowOutUpRight } from "lucide-react";

export function DesktopNav() {
  return (
    <NavigationMenu className="hidden sm:flex">
      <NavigationMenuList className=" flex-wrap gap-4">
        {navigationItems.map((item) => (
          <NavigationMenuItem
            className=" group/item cursor-pointer flex items-center gap-1 hover:text-blue-600 dark:hover:text-blue-300 hover:underline"
            key={item.name}
          >
            <Link href={`${item.href}`}>{item.name}</Link>
            <SquareArrowOutUpRight className=" opacity-0 w-4 h-4 group-hover/item:opacity-100 transition-opacity duration-300 " />
          </NavigationMenuItem>
        ))}
      </NavigationMenuList>
    </NavigationMenu>
  );
}
