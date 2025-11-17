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

export function DesktopNav() {
  return (
    <NavigationMenu>
      <NavigationMenuList className=" flex-wrap gap-4">
        {navigationItems.map((item) => (
          <NavigationMenuItem>
            <Link href={`${item.href}`}>{item.name}</Link>
          </NavigationMenuItem>
        ))}
      </NavigationMenuList>
    </NavigationMenu>
  );
}
