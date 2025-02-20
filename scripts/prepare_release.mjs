/* eslint-disable no-console */
import fs from "fs-extra";
import path from "path";
import { glob } from "glob";
import simpleGit from "simple-git";

const SOURCE_BUILD = "./build";
const RELEASE_DIR = "./dist";
const SOURCE_PACKAGE = "./package.json";
const LICENSE_FILE = "./LICENSE.md";

const GIT_USER_NAME = "AndreyMay";
const GIT_USER_EMAIL = "<>";
const REPO_URL = `https://${GIT_USER_NAME}@github.com/${GIT_USER_NAME}/tonemod.git`;

// List of fields to keep in the release package.json
const PACKAGE_FIELDS_TO_KEEP = [
    "name",
    "version",
    "description",
    "type",
    "main",
    "module",
    "types",
    // "unpkg",
    // "license",
    // "repository",
    // "keywords",
    "author",
    // "bugs",
    "dependencies",
    "exports",
    // "sideEffects",
];

async function pushToGithub() {
    try {
        const git = simpleGit();
        console.log("🚀 Pushing to GitHub...");
        
        // Initialize git in dist directory if not already initialized
        await git.cwd(RELEASE_DIR);
        
        const isRepo = await fs.pathExists(path.join(RELEASE_DIR, ".git"));
        if (!isRepo) {
            await git.init();
            await git.addRemote("origin", REPO_URL);
        }

        // Set Git user configuration
        await git.addConfig("user.name", GIT_USER_NAME);
        await git.addConfig("user.email", GIT_USER_EMAIL);

        // Add all files, commit, and push
        await git.add(".");
        const pkg = await fs.readJson(path.join(RELEASE_DIR, "package.json"));
        await git.commit(`Release version ${pkg.version}`);
        await git.push("origin", "main", ["--force"]); 

        console.log("✅ Successfully pushed to GitHub!");
    } catch (error) {
        console.error("❌ Error pushing to GitHub:", error);
        throw error;
    }
}

async function prepareRelease(unpkg = false, push = false) {
    try {
        // Ensure release directory exists
        await fs.ensureDir(RELEASE_DIR);

        // Clean release directory
        await fs.emptyDir(RELEASE_DIR);

        // Copy build files
        console.log("📦 Copying build files...");
        
        if (unpkg) {
            // Copy all files to build
            await fs.copy(SOURCE_BUILD, path.join(RELEASE_DIR, "build"));
        } else {
            // Copy ESM only to build/esm (default)
            await fs.ensureDir(path.join(RELEASE_DIR, "build", "esm"));
            await fs.copy(path.join(SOURCE_BUILD, "esm"), path.join(RELEASE_DIR, "build", "esm"));
        }

        // Copy LICENSE
        console.log("📄 Copying LICENSE...");
        await fs.copy(LICENSE_FILE, path.join(RELEASE_DIR, "LICENSE.md"));

        // Remove all .map files recursively
        console.log("🧹 Removing source maps...");
        const mapFiles = await glob("**/*.map", { cwd: RELEASE_DIR });
        for (const file of mapFiles) {
            await fs.remove(path.join(RELEASE_DIR, file));
        }

        // Read and clean package.json
        console.log("📝 Creating minimal package.json...");
        const pkg = await fs.readJson(SOURCE_PACKAGE);

        // Add unpkg if unpkg
        if (unpkg) {
            PACKAGE_FIELDS_TO_KEEP.push("unpkg");
        }
        
        // Filter package.json to keep only necessary fields
        const minimalPkg = Object.fromEntries(
            Object.entries(pkg)
                .filter(([key]) => PACKAGE_FIELDS_TO_KEEP.includes(key))
        );

        minimalPkg.description = "[MOD] " + minimalPkg.description;
        
        // Write minimal package.json
        await fs.writeJson(
            path.join(RELEASE_DIR, "package.json"),
            minimalPkg,
            { spaces: 2 }
        );

        console.log("✅ Release prepared successfully!");
        console.log(`📁 Output location: ${RELEASE_DIR}`);
        console.log("📦 ESM build created");
        if (unpkg) {
            console.log("📦 Unpkg build created");
        }

        // Push to GitHub if --push flag is set
        if (push) {
            await pushToGithub();
        }

    } catch (error) {
        console.error("❌ Error preparing release:", error);
        process.exit(1);
    }
}

// Parse command line arguments
const unpkg = process.argv.includes("--unpkg");
const push = process.argv.includes("--push");
prepareRelease(unpkg, push);
