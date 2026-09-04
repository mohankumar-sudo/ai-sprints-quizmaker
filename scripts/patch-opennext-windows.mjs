import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const target = path.join(
	path.dirname(fileURLToPath(import.meta.url)),
	"..",
	"node_modules",
	"@opennextjs",
	"aws",
	"dist",
	"build",
	"copyTracedFiles.js",
);

const original = `            catch (e) {
                if (e.code !== "EEXIST") {
                    throw e;
                }
            }`;

const patched = `            catch (e) {
                if (e.code === "EEXIST") {
                    // Ignore existing symlink target.
                } else if (e.code === "EPERM") {
                    const resolvedFrom = path.resolve(path.dirname(from), symlink);
                    symlinkSync(path.resolve(resolvedFrom), path.resolve(to), "junction");
                } else {
                    throw e;
                }
            }`;

const source = readFileSync(target, "utf8");

if (source.includes(patched) || source.includes('symlinkSync(resolvedFrom, to, "junction")')) {
	console.log("OpenNext Windows symlink patch already applied.");
	process.exit(0);
}

if (!source.includes(original)) {
	console.error("OpenNext copyTracedFiles.js changed; Windows patch not applied.");
	process.exit(1);
}

writeFileSync(target, source.replace(original, patched));
console.log("Applied OpenNext Windows symlink fallback patch.");
