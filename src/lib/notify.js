/* eslint-disable no-console */

import nodemailer from 'nodemailer';
import mg from 'nodemailer-mailgun-transport';

const auth = {
  auth: {
    api_key: process.env.MAILGUN_API_KEY,
    domain: process.env.MAILGUN_DOMAIN
  }
};

const config = {
  from: process.env.NOTIFY_SENDER,
  to: process.env.NOTIFY_RECIPIENTS.split(',')
};

const mailer = nodemailer.createTransport(mg(auth));

export default function notify(msg) {
  return new Promise((resolve, reject) => {
    mailer.sendMail({
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
          ...config,
          ...msg
        }, null, 2));
      }
    });
  });
}
