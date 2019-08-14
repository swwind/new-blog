const randomString = require('./random-string');
const fs = require('fs');
const os = require('os');

const accessToken = (process.env.NODE_ENV !== 'production' && process.env.NODE_ENV !== 'test') ? '1' : randomString(15);
const savePath = os.platform() === 'win32' ? null : `/var/run/user/${process.getuid()}/blog-access-token`;

console.log(`Your access token is ${accessToken}`);
if (savePath) {
  fs.writeFile(savePath, accessToken, err => {
    err || console.log(`In case you forget, just restart the server, or find it in ${savePath}`);
  });
}

module.exports = accessToken;
