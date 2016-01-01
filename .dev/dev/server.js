'use strict';

/**
 * Module dependencies.
 * @private
 */
const path = require('path');
const express = require('express');
const webpack = require('webpack');

const webpackConfig = require('../_config/webpack.dev.config');

const port = 8080;

const app  = express();
const compiler = webpack(webpackConfig);

const devMiddleware = require('webpack-dev-middleware')(compiler, {
  publicPath: webpackConfig.output.publicPath,
  quiet: true
});

const hotMiddleware = require('webpack-hot-middleware')(compiler, {
  log: () => {}
});

compiler.plugin('compilation', compilation => {
  compilation.plugin('html-webpack-plugin-after-emit', (data, callback) => {
    hotMiddleware.publish({ action: 'reload' });
    callback();
  });
});

app.use(require('connect-history-api-fallback')());
app.use(devMiddleware);
app.use(hotMiddleware);
app.use('/', express.static('./src/www/frontend/static'));

devMiddleware.waitUntilValid(() => {
  console.log('> Listening at http://localhost:' + port + '\n')
});

app.listen(port, error => {
  if (error) {
    console.log(error);

    return;
  }
});
