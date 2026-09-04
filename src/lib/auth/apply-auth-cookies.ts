import { cookies } from "next/headers";
import {
	parseSetCookieHeader,
	toCookieOptions,
} from "better-auth/cookies/utils";

export async function applyAuthResponseCookies(
	responseHeaders?: Headers,
): Promise<void> {
	if (!responseHeaders) {
		return;
	}

	const setCookieHeader = responseHeaders.get("set-cookie");
	if (!setCookieHeader) {
		return;
	}

	try {
		const cookieStore = await cookies();
		const parsed = parseSetCookieHeader(setCookieHeader);

		parsed.forEach((value, key) => {
			if (!key) {
				return;
			}

			cookieStore.set(key, value.value, toCookieOptions(value));
		});
	} catch (error) {
		if (
			error instanceof Error &&
			(error.message.startsWith("`cookies` was called outside a request scope.") ||
				error.message.includes("Cannot find module"))
		) {
			return;
		}

		throw error;
	}
}
