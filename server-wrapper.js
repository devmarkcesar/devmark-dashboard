const fs = require('fs');
const path = require('path');

const envPath = path.resolve(__dirname, '.env.production');
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, 'utf8').split('\n').forEach(line => {
    const idx = line.indexOf('=');
    if (idx > 0 && !line.startsWith('#')) {
      const key = line.substring(0, idx).trim();
      let val = line.substring(idx + 1).replace(/\r$/, '');
      // Strip surrounding single/double quotes
      if (val.length >= 2 &&
          ((val[0] === "'" && val[val.length - 1] === "'") ||
           (val[0] === '"' && val[val.length - 1] === '"'))) {
        val = val.slice(1, -1);
      }
      // Unescape \$ → $ (dotenv-expand escape convention)
      val = val.replace(/\\\$/g, '$');
      if (key) process.env[key] = val;
    }
  });
}

require('./server.js');
