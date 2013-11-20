# PM2-Web

A web based monitor for [PM2](https://github.com/Unitech/pm2). Originally based on work done by [dunxrion](https://github.com/dunxrion).

![Screenshot of web monitor](https://raw.github.com/achingbrain/pm2-web/master/assets/screenshot.png)

## To run

Install pm2-web:

```
$ npm install -g pm2-web
```

Then run:

```
$ pm2-web
```

You can override several arguments:

```
$ pm2-web --www:port 9000 --mdns:name pm2-web
```
