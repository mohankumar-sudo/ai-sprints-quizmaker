import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import {
	isAuthRoute,
	isProtectedRoute,
	hasSessionCookie,
} from "@/lib/auth/route-protection";

export function proxy(request: NextRequest) {
	const { pathname } = request.nextUrl;

	if (isProtectedRoute(pathname)) {
		if (!hasSessionCookie(request.cookies)) {
			return NextResponse.redirect(new URL("/sign-in", request.url));
		}
	}

	if (isAuthRoute(pathname)) {
		if (hasSessionCookie(request.cookies)) {
			return NextResponse.redirect(new URL("/dashboard", request.url));
		}
	}

	return NextResponse.next();
}

export const config = {
	matcher: ["/dashboard", "/mcqs/:path*", "/sign-in", "/sign-up"],
};
