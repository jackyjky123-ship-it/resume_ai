// Patches @react-pdf/hyphenate exports to include a "default" condition so
// Node.js CommonJS loaders (like tsx) can resolve subpath language exports.
const fs = require("fs");
const path = require("path");

const pkgPath = path.join(
  __dirname,
  "..",
  "node_modules",
  "@react-pdf",
  "hyphenate",
  "package.json"
);

try {
  if (fs.existsSync(pkgPath)) {
    const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
    if (pkg.exports && pkg.exports["./*"] && !pkg.exports["./*"].default) {
      pkg.exports["./*"].default = pkg.exports["./*"].import;
      fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n");
      // eslint-disable-next-line no-console
      console.log("Patched @react-pdf/hyphenate package.json exports");
    }
  }
} catch {
  // Silent on failure in non-standard environments
}

