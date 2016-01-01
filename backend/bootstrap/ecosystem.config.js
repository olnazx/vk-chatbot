'use strict';

/**
 * Module dependencies.
 * @private
 */
const path = require('path');

const cwd = process.cwd();

module.exports = {
  apps: [
    // API Server
    {
      name: 'api',
      script: './backend/server/main.js',
      env: {
        DEBUG: process.env.DEBUG
      },
      cwd,
      node_args: ['--harmony'],
      error_file: path.join(cwd, './logs/api-error.log'),
      out_file: path.join(cwd, './logs/api-out.log')
    }, 

    // Bot
    {
      name: 'bot',
      script: './backend/bot/main.js',
      env: {
        DEBUG: process.env.DEBUG
      },
      cwd,
      node_args: ['--harmony'],
      error_file: path.join(cwd, './logs/bot-error.log'),
      out_file: path.join(cwd, './logs/bot-out.log'),
      max_memory_restart: '250M'
    }
  ]
}
