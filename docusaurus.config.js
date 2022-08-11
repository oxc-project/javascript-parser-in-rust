// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const lightCodeTheme = require('prism-react-renderer/themes/github');
const darkCodeTheme = require('prism-react-renderer/themes/dracula');

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Write a JavaScript Compiler in Rust',
  url: 'https://boshen.github.io',
  baseUrl: '/javascript-compiler-in-rust/',
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'throw',
  onDuplicateRoutes: 'throw',
  organizationName: 'Boshen', // Usually your GitHub org/user name.
  projectName: 'javascript-compiler-in-rust', // Usually your repo name.
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },
  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
          editUrl: 'https://github.com/Boshen/javascript-compiler-in-rust/tree/main/docs/',
          showReadingTime: true,
        },
        blog: {
          editUrl: 'https://github.com/Boshen/javascript-compiler-in-rust/tree/main/blog',
          showReadingTime: true,
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      metadata: [{name: 'keywords', content: 'rust, javascript, compiler, tutorial'}],
      colorMode: {
        defaultMode: 'dark',
      },
      navbar: {
        title: 'Home',
        items: [
          {
            type: 'doc',
            docId: 'intro',
            position: 'left',
            label: 'Book',
          },
          {to: '/blog', label: 'Tutorials', position: 'left'},
          {
            href: 'https://github.com/Boshen/javascript-compiler-in-rust',
            label: 'GitHub',
            position: 'right',
          },
        ],
      },
      prism: {
        theme: lightCodeTheme,
        darkTheme: darkCodeTheme,
        additionalLanguages: ['rust']
      },
    }),
};

module.exports = config;
