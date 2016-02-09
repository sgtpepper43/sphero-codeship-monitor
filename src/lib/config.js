/* eslint no-process-env: 0 */
require('dotenv').config();

export default {
  GITHUB_USERNAME: process.env.GITHUB_USERNAME,
  NODE_ENV: process.env.NODE_ENV,
  CODESHIP_KEY: process.env.CODESHIP_KEY,
  SPHERO_PORT: process.env.SPHERO_PORT
};
