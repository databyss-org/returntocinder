// const env = require('dotenv').config().parsed;

module.exports = {
  apps: [
    {
      name: 'r2c-express',
      script: './build/server.js',
      watch: true,
      instances: 1,
      // env
    },
  ],
};
