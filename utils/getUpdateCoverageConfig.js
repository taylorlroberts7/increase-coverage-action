const updateJestCoverage = (coverage, config) => {
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

  return config;
};

const updateNycCoverage = (coverage, config) => {
  return {
    ...config,
    branches: coverage.total.branches.pct,
    functions: coverage.total.functions.pct,
    lines: coverage.total.lines.pct,
    statements: coverage.total.statements.pct,
  };
};

module.exports = (coverageType) => {
  let updateCoverageMethod = null;

  switch (coverageType) {
    case "nyc":
      updateCoverageMethod = updateNycCoverage;
      break;

    default:
      updateCoverageMethod = updateJestCoverage;
      break;
  }

  return updateCoverageMethod;
};
