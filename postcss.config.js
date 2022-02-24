const path = require('path');
const postcssImport = require('postcss-import');
const postcssNested = require('postcss-nested');
const postcssPresetEnv = require('postcss-preset-env');
const postcssReporter = require('postcss-reporter');
const postcssAssets = require('postcss-assets');
const cssNano = require('cssnano');
const tailwindcss = require('tailwindcss');
const autoprefixer = require('autoprefixer');

module.exports = {
  plugins: [
    postcssImport,
    postcssNested,
    postcssPresetEnv,
    // PostCSS7
    postcssAssets({
      loadPaths: [path.resolve(__dirname, 'src/assets')],
      relative: true,
    }),
    cssNano({
      preset: 'default',
    }),
    postcssReporter({
      clearMessages: true,
    }),
    tailwindcss,
    autoprefixer,
  ],
};
