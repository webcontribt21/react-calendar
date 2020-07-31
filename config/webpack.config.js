/* eslint-disable global-require */
const path = require('path');
const fs = require('fs');
const { DefinePlugin } = require('webpack');
const HtmlWebPackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const ManifestPlugin = require('webpack-manifest-plugin');
const dotenv = require('dotenv');

// style files regexes
const cssRegex = /\.css$/;
const cssModuleRegex = /\.module\.css$/;
const sassRegex = /\.(scss|sass)$/;
const sassModuleRegex = /\.module\.(scss|sass)$/;

const getStyleLoaders = (mode, cssOptions, preProcessor) => {
  const isDev = mode === 'development';

  const loaders = [
    isDev && require.resolve('style-loader'),
    !isDev && {
      loader: MiniCssExtractPlugin.loader,
      options: {
        hmr: isDev,
      },
    },
    {
      loader: require.resolve('css-loader'),
      options: cssOptions,
    },
    {
      loader: require.resolve('postcss-loader'),
      options: {
        ident: 'postcss',
        plugins: () => [
          require('postcss-flexbugs-fixes'),
          require('postcss-preset-env')({
            autoprefixer: {
              flexbox: 'no-2009',
            },
            stage: 3,
          }),
        ],
        sourceMap: isDev,
      },
    },
  ].filter(Boolean);
  if (preProcessor) {
    loaders.push({
      loader: require.resolve(preProcessor),
      options: {
        sourceMap: isDev,
      },
    });
  }
  return loaders;
};

module.exports = env => {
  const isDev = env.ENVIRONMENT === 'development';

  const currentPath = path.join(__dirname);

  // Create the fallback path (the production .env)
  const basePath = `${currentPath}/.env`;
  const envPath = `${basePath}.${env.ENVIRONMENT}`;
  const finalPath = fs.existsSync(envPath) ? envPath : basePath;
  const fileEnv = dotenv.config({ path: finalPath }).parsed;

  const envKeys = Object.keys(fileEnv).reduce((prev, next) => {
    // eslint-disable-next-line no-param-reassign
    prev[next] = JSON.stringify(fileEnv[next]);
    return prev;
  }, {});

  let plugins = [
    new HtmlWebPackPlugin({
      inject: true,
      template: path.resolve(
        __dirname,
        '../public',
        `index.${isDev ? 'dev.' : ''}html`,
      ),
    }),
    new CopyPlugin([
      {
        from: path.resolve(__dirname, '../public'),
        ignore: ['index.html', 'index.dev.html'],
        to: path.resolve(__dirname, '../dist'),
      },
    ]),
    new DefinePlugin({
      'process.env': {
        ENVIRONMENT: JSON.stringify(env.ENVIRONMENT),
        USE_TOKEN: JSON.stringify(env.USE_TOKEN),
        ...envKeys,
      },
    }),
  ];

  if (!isDev) {
    plugins = [
      ...plugins,
      new MiniCssExtractPlugin({
        chunkFilename: '[name].[contenthash:8].chunk.css',
        filename: '[name].[contenthash:8].css',
      }),
    ];
  } else {
    plugins = [new CleanWebpackPlugin(), ...plugins];
  }

  return {
    bail: !isDev,
    devServer: {
      compress: false,
      contentBase: path.resolve(__dirname, '../dist'),
      headers: {
        'Access-Control-Allow-Headers':
          'X-Requested-With, content-type, Authorization',
        'Access-Control-Allow-Methods':
          'GET, POST, PUT, DELETE, PATCH, OPTIONS',
        'Access-Control-Allow-Origin': '*',
      },
      historyApiFallback: true,
      hot: true,
      hotOnly: true,
      index: 'index.html',
      inline: true,
      open: false,
      port: 8080,
      progress: true,
      watchContentBase: true,
    },
    devtool: isDev ? 'eval-source-map' : false,
    entry: {
      kronologic: path.resolve(__dirname, '../src', 'index.js'),
    },
    mode: env.ENVIRONMENT,
    module: {
      rules: [
        {
          oneOf: [
            {
              loader: require.resolve('url-loader'),
              options: {
                limit: 10000,
              },
              test: [/\.gif$/, /\.jpe?g$/, /\.png$/],
            },
            {
              exclude: [
                /@babel(?:\/|\\{1,2})runtime/,
                /node_modules/,
              ],
              include: path.resolve(__dirname, '../src'),
              test: /\.js$/,
              use: [
                {
                  loader: require.resolve('babel-loader'),
                  options: {
                    babelrc: true,
                    cacheCompression: !isDev,
                    cacheDirectory: true,
                    compact: !isDev,
                    sourceMaps: !isDev,
                  },
                },
                {
                  loader: require.resolve('eslint-loader'),
                },
              ],
            },
            {
              exclude: cssModuleRegex,
              sideEffects: true,
              test: cssRegex,
              use: getStyleLoaders({
                importLoaders: 1,
                mode: env.ENVIRONMENT,
                sourceMap: isDev,
              }),
            },
            {
              test: cssModuleRegex,
              use: getStyleLoaders({
                importLoaders: 1,
                localIdentName: '[name]__[local]___[hash:base64:5]',
                mode: env.ENVIRONMENT,
                modules: true,
                sourceMap: isDev,
              }),
            },
            {
              exclude: sassModuleRegex,
              sideEffects: true,
              test: sassRegex,
              use: getStyleLoaders(
                env.ENVIRONMENT,
                {
                  importLoaders: 2,
                  sourceMap: isDev,
                },
                'sass-loader',
              ),
            },
            {
              test: sassModuleRegex,
              use: getStyleLoaders(
                env.ENVIRONMENT,
                {
                  importLoaders: 2,
                  localIdentName: '[name]__[local]___[hash:base64:5]',
                  modules: true,
                  sourceMap: isDev,
                },
                'sass-loader',
              ),
            },
            {
              test: /\.(woff(2)?|eot|otf|ttf|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
              use: {
                loader: require.resolve('file-loader'),
                options: {
                  name: 'static/media/fonts/[name].[hash:8].[ext]',
                },
              },
            },
            {
              exclude: [
                /\.(js|ttf|svg|eot|otf|woof(2)?)$/,
                /\.html$/,
                /\.json$/,
              ],
              loader: require.resolve('file-loader'),
              options: {
                name: 'static/media/[name].[hash:8].[ext]',
              },
            },
            // ** STOP ** Are you adding a new loader?
            // Make sure to add the new loader(s) before the "file" loader.
          ],
        },
      ],
    },
    output: {
      filename: !isDev ? '[name].[chunkhash:8].js' : 'dev-bundle.js',
      library: 'kronologic',
      libraryTarget: 'umd',
      path: path.resolve(__dirname, '../dist'),
      publicPath: '/',
    },
    plugins,
    resolve: {
      alias: {
        assets: path.resolve(__dirname, '../src/assets'),
        'react-dom': '@hot-loader/react-dom',
      },
      extensions: [
        '.js',
        '.css',
        '.scss',
        '.json',
        '.csv',
        '.svg',
        '.png',
        '.jpg',
        '.jpeg',
        '.module.scss',
      ],
      modules: ['../src', '../node_modules'],
      unsafeCache: true,
    },
  };
};
