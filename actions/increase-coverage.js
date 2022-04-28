const core = require("@actions/core");
const cache = require("@actions/cache");
const fs = require("fs");
// const glob = require("@actions/glob");

// const patterns = ["**/tar.gz", "**/tar.bz"];
// const globber = await glob.create(patterns.join("\n"));
// const files = await globber.glob();

const format = require("json-format");

module.exports = async () => {
  try {
    const coverageSummaryPath = core.getInput("summary-path");
    const configPath = core.getInput("config-path");

    const summaryKey = core.getInput("summary-key");
    const configKey = core.getInput("config-key");

    const configCache = await cache.restoreCache([configPath], configKey);
    console.log("configCache -chk", configCache);

    const summaryCache = await cache.restoreCache(
      [coverageSummaryPath],
      summaryKey
    );

    console.log("summaryCache -chk", summaryCache);

    // const coverageJson = fs.readFile(
    //   // "coverage/coverage-summary.json",
    //   coverageSummaryPath,
    //   (err, data) => {

    //     if (err) throw err;

    //     console.log("summary data -chk", JSON.parse(data));
    //   }
    // );
    const coverageJson = JSON.parse(
      fs.readFileSync(coverageSummaryPath, "utf8")
    );

    console.log("coverageJson -chk", coverageJson);

    const configJson = fs.readFile(
      // "coverage/coverage-summary.json",
      configPath,
      (err, data) => {
        console.log("config err -chk", err);

        if (err) throw err;

        console.log("config data -chk", JSON.parse(data));
      }
    );

    console.log("configJson -chk", configJson);

    // const coverage = require(coverageSummaryPath);
    // const config = require(configPath);

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

    // fs.writeFile("./jest.config.local.json", format(config), (err) => {
    //   if (err) {
    //     console.log("Error writing file", err);
    //   } else {
    //     console.log("Successfully wrote file");
    //   }
    // });
  } catch (error) {
    core.setFailed(error.message);
  }
};
