const core = require("@actions/core");
const cache = require("@actions/cache");
const fs = require("fs");

const format = require("json-format");

module.exports = async () => {
  try {
    const configKey = core.getInput("config-key");
    const configPath = core.getInput("config-path");
    const configRestoreKeys = core
      .getInput("config-restore-keys")
      .split("\n")
      .filter((x) => x !== "");

    const summaryKey = core.getInput("summary-key");
    const summaryPath = core.getInput("summary-path");
    const summaryRestoreKeys = core
      .getInput("summary-restore-keys")
      .split("\n")
      .filter((x) => x !== "");

    const shouldSetGlobalThreshold = core
      .getInput("should-set-global")
      .toString();

    const inputs = {
      configKey,
      configPath,
      configRestoreKeys,
      summaryKey,
      summaryPath,
      summaryRestoreKeys,
      shouldSetGlobalThreshold,
    };

    core.debug("Input values:");
    core.debug(JSON.stringify(inputs));

    const configCache = await cache.restoreCache(
      [configPath],
      configKey,
      configRestoreKeys
    );

    core.debug("configCache:");
    core.debug(configCache || "undefined");

    if (!configCache) {
      throw Error("Failed to retrieve config file from cache");
    }

    const summaryCache = await cache.restoreCache(
      [summaryPath],
      summaryKey,
      summaryRestoreKeys
    );

    core.debug("summaryCache:");
    core.debug(summaryCache || "undefined");

    if (!summaryCache) {
      throw Error("Failed to retrieve summary file from cache");
    }

    const coverage = JSON.parse(fs.readFileSync(summaryPath, "utf8"));
    const config = JSON.parse(fs.readFileSync(configPath, "utf8"));

    const coverageByFile = {};
    Object.keys(coverage).forEach((key) => {
      if (key !== "total") {
        const filePath = key.substring(key.indexOf("src"));
        coverageByFile[`./${filePath}`] = {
          branches: coverage[key].branches.pct,
          functions: coverage[key].functions.pct,
          lines: coverage[key].lines.pct,
          statements: coverage[key].statements.pct,
        };
      }
    });

    if (shouldSetGlobalThreshold === "true") {
      core.debug("Setting global coverage threshold");

      config.coverageThreshold = {
        global: {
          branches: coverage.total.branches.pct,
          functions: coverage.total.functions.pct,
          lines: coverage.total.lines.pct,
          statements: coverage.total.statements.pct,
        },
        ...coverageByFile,
      };
    } else {
      core.debug("Skipping global coverage threshold");

      config.coverageThreshold = coverageByFile;
    }

    fs.writeFile(configPath, format(config), (err) => {
      if (err) {
        console.log("Error writing file", err);
      } else {
        console.log("Successfully wrote file");
      }
    });
  } catch (error) {
    core.setFailed(error.message);
  }
};
