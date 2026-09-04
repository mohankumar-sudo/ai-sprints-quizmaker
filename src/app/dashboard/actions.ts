"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { signOutUser } from "@/lib/auth/sign-in";
import { getAuth } from "@/lib/auth/server";

export async function logoutAction() {
	const auth = await getAuth();
	await signOutUser(auth, await headers());
	redirect("/sign-in");
}
