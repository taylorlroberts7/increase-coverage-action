const cache = require("@actions/cache");
const core = require("@actions/core");
const format = require("json-format");
const fs = require("fs");

const getUpdateCoverage = require("../utils/getUpdateCoverageConfig");

module.exports = async () => {
  try {
    const coverageSummaryPath = core.getInput("summary-path");
    const configPath = core.getInput("config-path");

    const coverageType = core.getInput("coverage-type");
    const summaryKey = core.getInput("summary-key");
    const configKey = core.getInput("config-key");

    console.log("configPath -chk", configPath);
    console.log("configKey -chk", configKey);

    const configCache = await cache.restoreCache([configPath], configKey);

    const summaryCache = await cache.restoreCache(
      [coverageSummaryPath],
      summaryKey
    );

    console.log("summaryCache -chk", summaryCache);

    if (!configCache) {
      throw Error("Failed to retrieve config file from cache");
    }

    if (!summaryCache) {
      throw Error("Failed to retrieve summary file from cache");
    }

    const updateCoverage = getUpdateCoverage(coverageType);

    const coverage = JSON.parse(fs.readFileSync(coverageSummaryPath, "utf8"));
    const config = JSON.parse(fs.readFileSync(configPath, "utf8"));

    // const coverageByFile = {};
    // Object.keys(coverage).forEach((key) => {
    //   if (key !== "total") {
    //     const filePath = key.substring(key.indexOf("src"));
    //     coverageByFile[`./${filePath}`] = {
    //       branches: coverage[key].branches.pct,
    //       functions: coverage[key].functions.pct,
    //       lines: coverage[key].lines.pct,
    //       statements: coverage[key].statements.pct,
    //     };
    //   }
    // });

    // config.coverageThreshold = {
    //   global: {
    //     branches: coverage.total.branches.pct,
    //     functions: coverage.total.functions.pct,
    //     lines: coverage.total.lines.pct,
    //     statements: coverage.total.statements.pct,
    //   },
    //   ...coverageByFile,
    // };

    const updatedConfig = updateCoverage(coverage, config);

    // fs.writeFile(configPath, format(config), (err) => {
    fs.writeFile(configPath, format(updatedConfig), (err) => {
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
