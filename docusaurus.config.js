// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const lightCodeTheme = require("prism-react-renderer/themes/github");
const darkCodeTheme = require("prism-react-renderer/themes/dracula");

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: "Write a JavaScript Parser in Rust",
  url: "https://boshen.github.io",
  baseUrl: "/javascript-parser-in-rust/",
  onBrokenLinks: "throw",
  onBrokenMarkdownLinks: "throw",
  onDuplicateRoutes: "throw",
  organizationName: "Boshen", // Usually your GitHub org/user name.
  projectName: "javascript-parser-in-rust", // Usually your repo name.
  i18n: {
    defaultLocale: "en",
    locales: ["en", "ja"],
  },
  presets: [
    [
      "classic",
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: require.resolve("./sidebars.js"),
          editUrl:
            "https://github.com/Boshen/javascript-parser-in-rust/tree/main/docs/",
        },
        blog: {
          blogSidebarTitle: "Tutorials",
          blogSidebarCount: "ALL",
          sortPosts: "ascending",
          editUrl:
            "https://github.com/Boshen/javascript-parser-in-rust/tree/main/blog",
          showReadingTime: true,
        },
        theme: {
          customCss: require.resolve("./src/css/custom.css"),
        },
      }),
    ],
  ],
  themes: ["@vegaprotocol/docusaurus-theme-github-codeblock"],
  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      metadata: [
        { name: "keywords", content: "rust, javascript, compiler, tutorial" },
      ],
      colorMode: {
        defaultMode: "dark",
      },
      navbar: {
        title: "Home",
        items: [
          {
            type: "doc",
            docId: "intro",
            position: "left",
            label: "Guide",
          },
          { to: "/blog", label: "Tutorials", position: "left" },
          {
            type: "localeDropdown",
            position: "right",
          },
          {
            href: "https://github.com/Boshen/javascript-parser-in-rust",
            label: "GitHub",
            position: "right",
          },
        ],
      },
      prism: {
        theme: lightCodeTheme,
        darkTheme: darkCodeTheme,
        additionalLanguages: ["rust"],
      },
    }),
};

module.exports = config;
