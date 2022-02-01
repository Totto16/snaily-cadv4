/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable @typescript-eslint/no-var-requires */
// for a detailed explanation regarding each configuration property, visit:
// https://jestjs.io/docs/en/configuration.html

const tsconfig = require("./tsconfig.json");
const moduleNameMapper = require("tsconfig-paths-jest")(tsconfig);

// eslint-disable-next-line
module.exports = {
  // automatically clear mock calls and instances between every test
  clearMocks: true,

  // indicates whether the coverage information should be collected while executing the test
  collectCoverage: true,

  // an array of glob patterns indicating a set of files for which coverage information should be collected
  // collectCoverageFrom: undefined,

  // the directory where Jest should output its coverage files
  coverageDirectory: "coverage",

  // an array of regexp pattern strings used to skip coverage collection
  coveragePathIgnorePatterns: ["index.ts", "/node_modules/"],

  // an array of file extensions your modules use
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
  moduleNameMapper,

  // the test environment that will be used for testing
  testEnvironment: "node",

  // the glob patterns Jest uses to detect test files
  testMatch: ["**/src/**/__tests__/**/*.[jt]s?(x)", "**/src/**/?(*.)+(spec|test).[tj]s?(x)"],
  // a map from regular expressions to paths to transformers
  transform: {
    "\\.(ts)$": "ts-jest",
  },
};
