// const env = require('dotenv').config().parsed;

module.exports = {
  apps: [
    {
      name: 'r2c-express',
      script: './build/server.js',
      node_args: '--expose-gc',
      watch: true,
      instances: 1,
      // env
    },
  ],
};
