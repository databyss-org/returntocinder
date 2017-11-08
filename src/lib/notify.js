/* eslint-disable no-console */

import mailgun from 'mailgun-js';

const auth = {
  apiKey: process.env.MAILGUN_API_KEY,
  domain: process.env.MAILGUN_DOMAIN
};

const config = {
  from: process.env.NOTIFY_SENDER,
  to: process.env.NOTIFY_RECIPIENTS.split(',')
};

const mailer = mailgun(auth);

export default function notify(msg) {
  return new Promise((resolve, reject) => {
    mailer.send({
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
