const { AUTH_METHODS } = require('./config-options');

module.exports = {
  port: 20000,
  host: '::1',
  authMethod: AUTH_METHODS.NO_AUTH
};
