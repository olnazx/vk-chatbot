'use strict';

/**
 * Module dependencies.
 * @private
 */
const webpack = require('webpack');

webpack(require('../_config/webpack.prod.config'), function (err, stats) {
  if (err) throw err;

  process.stdout.write('\n' + stats.toString({
    colors: true,
    modules: false,
    children: false,
    chunks: false,
    chunkModules: false
  }) + '\n')
});
