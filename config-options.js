const NETWORK_VERSION = 0x05,
      STATE = {
        HANDSHAKE: 0x00,
        AUTH: 0x01,
        REQUEST: 0x02,
        FORWARDING: 0x03
      },
      AUTH_METHODS = {
        NO_AUTH: [0x00, 'no_auth'],
        USER_PASS: [0x02, 'user_password'],
        NO_MATCH: [0xFF, 'no_match'],
        get(method) {
          switch(method) {
            case this.NO_AUTH[0]: return this.NO_AUTH;
            case this.USER_PASS[0]: return this.USER_PASS;
          }
          return false;
        }
      },
      COMMAND_TYPES = {
        CONNECT: [0x01, 'connect'],
        get(cmd) {
          switch(cmd) {
            case this.CONNECT[0]: return this.CONNECT;
          }
          return false;
        }
      },
      ADDR_TYPES = {
        IPV4: [0x01, 'ipv4'],
        DOMAIN: [0x03, 'domain'],
        get(atyp) {
          switch(atyp) {
            case this.IPV4[0]: return this.IPV4;
            case this.DOMAIN[0]: return this.DOMAIN;
          }
          return false;
        }
      },
      RESPONSE_CODES = {
        SUCCESS: [0x00, 'success'],
        FAILURE: [0x01, 'general_failure']
      };

module.exports = {
  NETWORK_VERSION, STATE, AUTH_METHODS, 
  COMMAND_TYPES, ADDR_TYPES, RESPONSE_CODES
};
