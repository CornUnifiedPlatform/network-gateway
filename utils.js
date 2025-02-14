module.exports = {
  ipToBytes(ip) {
    return ip.split('.').map(Number);
  }
};
