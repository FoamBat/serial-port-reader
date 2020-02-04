require('dotenv').config();

module.exports = {
  username: process.env.SN_USERNAME,
  password: process.env.SN_PASSWORD,
  instanceUrl: process.env.SN_INSTANCE_URL,
  DATA_INTERVAL: 1000 * 30, // 30 seconds
  LOGIN_INTERVAL: 1000 * 3 // 3 seconds
};
