/* eslint no-process-env: 0 */
require('dotenv').config();

export default {
  NODE_ENV: process.env.NODE_ENV,
  CODESHIP_KEY: process.env.CODESHIP_KEY,
  SPHERO_PORT: process.env.SPHERO_PORT
};
