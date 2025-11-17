"use client";
// Needs to display the Avatar icon.
// On clikcing the avatar icon, needs to show a dialog box kinda thing which will give user options.

import { Avatar, AvatarImage } from "@radix-ui/react-avatar";
import { AvatarFallback } from "./ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

import { LogOut, User } from "lucide-react";
import { logout } from "@/lib/logout";

export function UserNav() {
  return (
    <>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Avatar className="cursor-pointer">
            <AvatarImage
              className=" h-6 w-6 rounded-lg"
              src="https://github.com/shadcn.png"
            />
            <AvatarFallback>RS</AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuItem
            onSelect={() => console.log("ACCOUNT CLICKED")}
            className="flex"
          >
            <User />
            Account
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => logout()} className="flex">
            <LogOut />
            Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
