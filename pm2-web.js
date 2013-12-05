
var PM2Web = require(__dirname + "/server/app.js");

var pm2web = new PM2Web({});
pm2web.start();
