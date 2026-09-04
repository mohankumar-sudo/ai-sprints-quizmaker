import { cn } from "@/lib/utils";
import { describe, expect, it } from "vitest";

describe("vitest harness", () => {
	it("resolves the @/ path alias", () => {
		expect(cn("foo", "bar")).toBe("foo bar");
	});
});
