const fs = require('fs');
const path = require('path');

const envPath = path.resolve(__dirname, '.env.production');
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, 'utf8').split('\n').forEach(line => {
    const idx = line.indexOf('=');
    if (idx > 0 && !line.startsWith('#')) {
      const key = line.substring(0, idx).trim();
      const val = line.substring(idx + 1).replace(/\r$/, '');
      if (key) process.env[key] = val;
    }
  });
}

require('./server.js');
