const core = require("@actions/core");
const cache = require("@actions/cache");
const fs = require("fs");

const format = require("json-format");

module.exports = async () => {
  try {
    const coverageSummaryPath = core.getInput("summary-path");
    const configPath = core.getInput("config-path");

    const summaryKey = core.getInput("summary-key");
    const configKey = core.getInput("config-key");

    const configCache = await cache.restoreCache([configPath], configKey);

    if (!configCache) {
      throw Error("Failed to retrieve config file from cache");
    }

    const summaryCache = await cache.restoreCache(
      [coverageSummaryPath],
      summaryKey
    );

    if (!summaryCache) {
      throw Error("Failed to retrieve summary file from cache");
    }

    const coverage = JSON.parse(fs.readFileSync(coverageSummaryPath, "utf8"));
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

    config.coverageThreshold = {
      global: {
        branches: coverage.total.branches.pct,
        functions: coverage.total.functions.pct,
        lines: coverage.total.lines.pct,
        statements: coverage.total.statements.pct,
      },
      ...coverageByFile,
    };

    // TODO: Delete this after testing
    config.testKey = "hi";

    fs.writeFile("./jest.config.local.json", format(config), (err) => {
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
