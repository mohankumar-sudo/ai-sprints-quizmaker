import { describe, expect, it } from "vitest";

import { truncateText } from "@/lib/mcq/format";

describe("truncateText", () => {
	it("returns the original text when shorter than the limit", () => {
		expect(truncateText("Short question")).toBe("Short question");
	});

	it("truncates long text with an ellipsis", () => {
		const text = "A".repeat(100);
		expect(truncateText(text, 80)).toBe(`${"A".repeat(79)}…`);
	});
});
