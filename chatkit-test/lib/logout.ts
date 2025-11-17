"use server";

import { redirect } from "next/navigation";

export async function logout() {
  console.log("################## USER LOGOUT TRIGGERED ###################");
  redirect("/");
}
