/* eslint-disable no-console */

import mailgun from 'mailgun-js';

export default function notify(msg) {
  const auth = {
    apiKey: process.env.MAILGUN_API_KEY,
    domain: process.env.MAILGUN_DOMAIN
  };

  const mailer = mailgun(auth);

  const config = {
    from: process.env.NOTIFY_SENDER,
    to: process.env.NOTIFY_RECIPIENTS.split(',')
  };

  return new Promise((resolve, reject) => {
    mailer.messages().send({
      ...config,
      ...msg
    }, (error, info) => {
      if (error) {
        reject(JSON.stringify({
          type: 'NOTIFY ERROR',
          error,
          ...config,
          ...msg
        }, null, 2));
      } else {
        resolve(JSON.stringify({
          type: 'NOTIFY',
          info,
          ...config,
          ...msg
        }, null, 2));
      }
    });
  });
}
