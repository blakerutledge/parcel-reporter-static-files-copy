"use strict";
const { Reporter } = require("@parcel/plugin");
const fs = require("fs-extra");
const path = require("path");

const PACKAGE_JSON_SECTION = "staticFiles";

const staticCopyPlugin = new Reporter({
  async report({ event, options }) {
    if (event.type === "buildSuccess") {
      let config = Object.assign({}, getSettings(options.projectRoot));

      // Get all dist dir from targets, we'll copy static files into them
      let targets = Array.from(
        new Set(
          event.bundleGraph
            .getBundles()
            .filter((b) => b.target && b.target.distDir)
            .map((b) => b.target.distDir)
        )
      );

      let distPaths = config.distDir ? [config.distDir] : targets;

      if (config.staticOutPath) {
        distPaths = distPaths.map((p) => path.join(p, config.staticOutPath));
      }

      let staticPath =
        config.staticPath || path.join(options.projectRoot, "static");

      for (let distPath of distPaths) {
        fs.copy(staticPath, distPath);
      }
    }
  },
});

const getSettings = (projectRoot) => {
  let packageJson = JSON.parse(
    fs.readFileSync(path.join(projectRoot, "package.json"))
  );
  return Object.assign({}, packageJson[PACKAGE_JSON_SECTION]);
};

exports.default = staticCopyPlugin;
