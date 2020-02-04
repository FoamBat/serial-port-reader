const Request = require('request');
const { username, password, instanceUrl } = require('../config');

const sendDataToSnInstance = (json) => {
  Request.post(
    {
      headers: { 'content-type': 'application/json' },
      auth: {
        user: username,
        pass: password
      },
      url:
        instanceUrl +
        '/api/x_438913_solarpola/solarinverterdataimp/createRecord',
      body: JSON.stringify(json)
    },
    (error, response, body) => {
      if (error) {
        console.error(error);
      }
      console.log(body);
    }
  );
};

module.exports = sendDataToSnInstance;
