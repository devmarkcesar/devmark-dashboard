const fs = require('fs');
const path = require('path');

const envFile = path.join(__dirname, '.env.production');
const env = {};

if (fs.existsSync(envFile)) {
  fs.readFileSync(envFile, 'utf8').split('\n').forEach(line => {
    const match = line.match(/^([^#=]+)=(.*)/);
    if (match) env[match[1].trim()] = match[2].trim();
  });
}

module.exports = {
  apps: [{
    name: 'devmark-dashboard',
    script: '.next/standalone/server-wrapper.js',
    cwd: __dirname,
  }]
};
