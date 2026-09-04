import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { getServerSession } from "@/lib/auth/sign-in";
import { getAuth } from "@/lib/auth/server";
import type { SessionIdentity } from "@/lib/auth/session";

export const PROTECTED_ROUTES = ["/dashboard"] as const;
export const AUTH_ROUTES = ["/sign-in", "/sign-up"] as const;

export const SESSION_COOKIE_NAMES = [
	"better-auth.session_token",
	"__Secure-better-auth.session_token",
] as const;

export function hasSessionCookie(
	cookies: { get: (name: string) => { value: string } | undefined },
): boolean {
	return SESSION_COOKIE_NAMES.some((name) => Boolean(cookies.get(name)?.value));
}

export type RouteDecision =
	| { allowed: true }
	| { allowed: false; redirectTo: string };

export function getProtectedRouteDecision(
	session: SessionIdentity | null,
): RouteDecision {
	if (!session) {
		return { allowed: false, redirectTo: "/sign-in" };
	}

	return { allowed: true };
}

export function getGuestRouteDecision(session: SessionIdentity | null): RouteDecision {
	if (session) {
		return { allowed: false, redirectTo: "/dashboard" };
	}

	return { allowed: true };
}

export function isProtectedRoute(pathname: string): boolean {
	return PROTECTED_ROUTES.some(
		(route) => pathname === route || pathname.startsWith(`${route}/`),
	);
}

export function isAuthRoute(pathname: string): boolean {
	return AUTH_ROUTES.some(
		(route) => pathname === route || pathname.startsWith(`${route}/`),
	);
}

export async function getCurrentSession(): Promise<SessionIdentity | null> {
	const auth = await getAuth();
	return getServerSession(auth, await headers());
}

export async function requireSession(): Promise<SessionIdentity> {
	const session = await getCurrentSession();
	const decision = getProtectedRouteDecision(session);

	if (!decision.allowed) {
		redirect(decision.redirectTo);
	}

	return session as SessionIdentity;
}

export async function redirectIfAuthenticated(): Promise<void> {
	const session = await getCurrentSession();
	const decision = getGuestRouteDecision(session);

	if (!decision.allowed) {
		redirect(decision.redirectTo);
	}
}
