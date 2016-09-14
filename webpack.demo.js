var path = require('path');
var webpack = require('webpack');

// Webpack Plugins
var CommonsChunkPlugin = webpack.optimize.CommonsChunkPlugin;
var autoprefixer = require('autoprefixer');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var CopyWebpackPlugin = require('copy-webpack-plugin');

/**
 * Env
 * Get npm lifecycle event to identify the environment
 */
var ENV = process.env.MODE;
var isProd = ENV === 'build';

module.exports = function makeWebpackConfig() {
  /**
   * Config
   * Reference: http://webpack.github.io/docs/configuration.html
   * This is the object where all configuration gets set
   */
  var config = {};

  /**
   * Devtool
   * Reference: http://webpack.github.io/docs/configuration.html#devtool
   * Type of sourcemap to use per build type
   */
  if (isProd) {
    config.devtool = 'source-map';
  } else {
    config.devtool = 'eval-source-map';
  }

  // add debug messages
  config.debug = !isProd;

  /**
   * Entry
   * Reference: http://webpack.github.io/docs/configuration.html#entry
   */
  config.entry = {
    'polyfills': './tmp/src/polyfills.ts',
    'vendor': './tmp/src/vendor.ts',
    'app': './tmp/src/main.ts' // our angular app
  };

  /**
   * Output
   * Reference: http://webpack.github.io/docs/configuration.html#output
   */
  config.output = {
    path: root('demo', 'dist'),
    publicPath: isProd ? '/' : 'http://localhost:9090/',
    filename: isProd ? 'js/[name].[hash].js' : 'js/[name].js',
    chunkFilename: isProd ? '[id].[hash].chunk.js' : '[id].chunk.js'
  };

  /**
   * Resolve
   * Reference: http://webpack.github.io/docs/configuration.html#resolve
   */
  config.resolve = {
    modules: [root('tmp', 'src'), 'node_modules'],
    // only discover files that have those extensions
    extensions: ['', '.ts', '.js', '.css', '.scss', '.html']
  };

  /**
   * Loaders
   * Reference: http://webpack.github.io/docs/configuration.html#module-loaders
   * List: http://webpack.github.io/docs/list-of-loaders.html
   * This handles most of the magic responsible for converting modules
   */
  config.module = {
    loaders: [
      // Support for .ts files.
      {
        test: /\.ts$/,
        loader: 'awesome-typescript-loader',
        query: {
          'ignoreDiagnostics': [
            2346, // 2346 -> Supplied parameters do not match any signature of call target
          ]
        },
        include: root('tmp')
      },

      {
        test: /\.ts$/,
        loader: 'angular2-template-loader',
        include: root('tmp')
      },

      // copy those assets to output
      {test: /\.(png|jpe?g|gif|svg|woff|woff2|ttf|eot|ico)$/, loader: 'file?name=fonts/[name].[hash].[ext]?'},

      // Support for CSS as raw text
      // use 'null' loader in test mode (https://github.com/webpack/null-loader)
      // all css in src/style will be bundled in an external css file
      {
        test: /\.css$/,
        exclude: root('tmp', 'src', 'app'),
        loader: ExtractTextPlugin.extract({fallbackLoader: 'style',  loader: 'css?sourceMap!postcss'})
      },
      // all css required in src/app files will be merged in js files
      {test: /\.css$/, include: root('tmp', 'src', 'app'), loader: 'raw!postcss'},

      // support for .scss files
      // use 'null' loader in test mode (https://github.com/webpack/null-loader)
      // all css in src/style will be bundled in an external css file
      {
        test: /\.scss$/,
        exclude: root('src', 'app'),
        loader: ExtractTextPlugin.extract({fallbackLoader: 'style',  loader: 'css?sourceMap!postcss!sass'})
      },
      // all css required in src/app files will be merged in js files
      {test: /\.scss$/, exclude: root('tmp', 'src', 'style'), loader: 'raw!postcss!sass'},

      // support for .html as raw text
      // todo: change the loader to something that adds a hash to images
      {test: /\.html$/, loader: 'raw'},

      {test: /\.md$/, loader: 'html!markdown'}
    ],
    postLoaders: [],
    noParse: [/.+zone\.js\/dist\/.+/]
  };

  /**
   * Plugins
   * Reference: http://webpack.github.io/docs/configuration.html#plugins
   * List: http://webpack.github.io/docs/list-of-plugins.html
   */
  config.plugins = [
    // Define env variables to help with builds
    // Reference: https://webpack.github.io/docs/list-of-plugins.html#defineplugin
    new webpack.DefinePlugin({
      // Environment helpers
      'process.env': {
        ENV: JSON.stringify(ENV),
        version: JSON.stringify(require('./package.json').version)
      }
    }),

    new CommonsChunkPlugin({
      name: ['vendor', 'polyfills']
    }),

    // Inject script and link tags into html files
    // Reference: https://github.com/ampedandwired/html-webpack-plugin
    new HtmlWebpackPlugin({
      template: './tmp/src/public/index.html',
      chunksSortMode: 'dependency'
    }),

    // Extract css files
    // Reference: https://github.com/webpack/extract-text-webpack-plugin
    // Disabled when in test mode or not in build mode
    new ExtractTextPlugin({filename: 'css/[name].[hash].css', disable: !isProd})
  ];

  // Add build specific plugins
  if (isProd) {
    config.plugins.push(
      new webpack.LoaderOptionsPlugin({
        minimize: true,
        debug: false
      }),

      // Reference: http://webpack.github.io/docs/list-of-plugins.html#noerrorsplugin
      // Only emit files when there are no errors
      new webpack.NoErrorsPlugin(),

      // Reference: http://webpack.github.io/docs/list-of-plugins.html#dedupeplugin
      // Dedupe modules in the output
      // TODO: reactivate once fixed, see https://github.com/webpack/webpack/issues/2644
      //new webpack.optimize.DedupePlugin(),

      // Reference: http://webpack.github.io/docs/list-of-plugins.html#uglifyjsplugin
      // Minify all javascript, switch loaders to minimizing mode
      new webpack.optimize.UglifyJsPlugin({
      }),

      // Copy assets from the public folder
      // Reference: https://github.com/kevlened/copy-webpack-plugin
      new CopyWebpackPlugin([{
        from: root('tmp/src/public')
      }])
    );
  }

  /**
   * PostCSS
   * Reference: https://github.com/postcss/autoprefixer-core
   * Add vendor prefixes to your css
   */
  config.postcss = [
    autoprefixer({
      browsers: ['last 2 version']
    })
  ];

  /**
   * Dev server configuration
   * Reference: http://webpack.github.io/docs/configuration.html#devserver
   * Reference: http://webpack.github.io/docs/webpack-dev-server.html
   */
  config.devServer = {
    contentBase: './tmp/src/public',
    historyApiFallback: true,
    stats: 'minimal' // none (or false), errors-only, minimal, normal (or true) and verbose
  };

  return config;
}();

// Helper functions
function root(args) {
  args = Array.prototype.slice.call(arguments, 0);
  return path.join.apply(path, [__dirname].concat(args));
}
