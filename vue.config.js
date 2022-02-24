const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
  pages: {},
  pluginOptions: {
    browserExtension: {
      componentOptions: {
        background: {
          entry: './src/background',
        },
        contentScripts: {
          entries: {
            main: ['./src/content-scripts/main'],
          },
        },
      },
    },
  },

  css: {
    extract: false,
    loaderOptions: {
      postcss: {},
    },
  },

  configureWebpack: {
    devtool: process.env.NODE_ENV === 'development' ? 'inline-cheap-module-source-map' : false,
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
        '~': path.resolve(__dirname, 'src'),
      },
      extensions: ['.js', '.ts', '.vue', '.json'],
    },
    plugins: [
      new MiniCssExtractPlugin({
        filename: 'css/[name].css',
      }),
    ],
  },

  chainWebpack: (config) => {
    /*
     * Load SVGs as Vue components
     */

    const svgRule = config.module.rule('svg');
    svgRule.uses.clear();
    svgRule
      .oneOf('inline')
      .resourceQuery(/inline/)
      .use('vue-svg-loader')
      .loader('vue-svg-loader')
      .options({
        svgo: {
          plugins: [{ removeViewBox: false }],
        },
      })
      .end()
      .end()
      .oneOf('external')
      .use('url-loader')
      .loader('url-loader')
      .options({
        // name: 'assets/[name].[hash:8].[ext]',
        svgo: {
          plugins: [{ removeViewBox: false }],
        },
      });
  },
};
