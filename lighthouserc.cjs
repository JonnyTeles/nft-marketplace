/* global module */
module.exports = {
  ci: {
    collect: {
      startServerCommand: "npm run preview -- --host 127.0.0.1",
      url: ["http://127.0.0.1:4173/", "http://127.0.0.1:4173/nft/nft-aurora"],
      numberOfRuns: 3,
      settings: { preset: "desktop", chromeFlags: "--no-sandbox" },
    },
    assert: {
      assertions: {
        "categories:performance": ["warn", { minScore: 0.9 }],
        "categories:accessibility": ["warn", { minScore: 0.95 }],
        "categories:best-practices": ["warn", { minScore: 0.95 }],
        "categories:seo": ["warn", { minScore: 0.9 }],
      },
    },
    upload: { target: "filesystem", outputDir: "./lighthouse-reports" },
  },
};
