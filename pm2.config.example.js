module.exports = {
  apps: [
    {
      name: 'r2c-express',
      script: './build/server.js',
      node_args: '--expose-gc',
      watch: true,
      instances: 1,
      env: {
        DBX: '', // dropbox API key
        DEBUG: 0,
        GIT_URL: 'git@heroku.com:r2c.git',
        MAILGUN_API_KEY: '',
        MAILGUN_DOMAIN: 'mg.returntocinder.com',
        MAILGUN_PUBLIC_KEY: '',
        MAILGUN_SMTP_LOGIN: '',
        MAILGUN_SMTP_PASSWORD: '',
        MAILGUN_SMTP_PORT: 587,
        MAILGUN_SMTP_SERVER: 'smtp.mailgun.org',
        NOTIFY_RECIPIENTS: 'example@server.com,example2@server.com',
        NOTIFY_SENDER: 'notify@returntocinder.com',
      },
    },
  ],
};
