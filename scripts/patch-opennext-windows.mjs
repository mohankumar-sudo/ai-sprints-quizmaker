import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

const copyTracedFilesTarget = path.join(
	root,
	"node_modules",
	"@opennextjs",
	"aws",
	"dist",
	"build",
	"copyTracedFiles.js",
);

const helperTarget = path.join(
	root,
	"node_modules",
	"@opennextjs",
	"aws",
	"dist",
	"build",
	"helper.js",
);

function patchCopyTracedFiles() {
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

	const source = readFileSync(copyTracedFilesTarget, "utf8");

	if (
		source.includes(patched) ||
		source.includes('symlinkSync(resolvedFrom, to, "junction")')
	) {
		console.log("OpenNext Windows symlink patch already applied.");
		return;
	}

	if (!source.includes(original)) {
		console.error("OpenNext copyTracedFiles.js changed; Windows patch not applied.");
		process.exit(1);
	}

	writeFileSync(copyTracedFilesTarget, source.replace(original, patched));
	console.log("Applied OpenNext Windows symlink fallback patch.");
}

function patchInitOutputDir() {
	const original = `export function initOutputDir(options) {
    fs.rmSync(options.outputDir, { recursive: true, force: true });
    const { buildDir } = options;`;

	const patched = `export function initOutputDir(options) {
    try {
        fs.rmSync(options.outputDir, { recursive: true, force: true });
    } catch (error) {
        if (!(error?.code === "EBUSY" && process.platform === "win32")) {
            throw error;
        }
    }
    const { buildDir } = options;`;

	const source = readFileSync(helperTarget, "utf8");

	if (source.includes("error?.code === \"EBUSY\" && process.platform === \"win32\"")) {
		console.log("OpenNext Windows EBUSY patch already applied.");
		return;
	}

	if (!source.includes(original)) {
		console.error("OpenNext helper.js changed; EBUSY patch not applied.");
		process.exit(1);
	}

	writeFileSync(helperTarget, source.replace(original, patched));
	console.log("Applied OpenNext Windows EBUSY fallback patch.");
}

patchCopyTracedFiles();
patchInitOutputDir();
