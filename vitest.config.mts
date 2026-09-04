import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

export default defineConfig({
	plugins: [react(), tsconfigPaths()],
	test: {
		environment: "jsdom",
		globals: true,
		setupFiles: ["./vitest.setup.ts"],
		environmentMatchGlobs: [
			["src/lib/auth/registration.test.ts", "node"],
			["src/lib/auth/sign-in.test.ts", "node"],
			["src/lib/auth/session.test.ts", "node"],
			["src/lib/auth/route-protection.test.ts", "node"],
			["src/lib/auth/auth-journey.test.ts", "node"],
			["src/lib/auth/config.test.ts", "node"],
		],
	},
});
