# PM2-Web

A web based monitor for [PM2](https://github.com/Unitech/pm2).

![Screenshot of web monitor](https://raw.github.com/achingbrain/pm2-web/master/assets/screenshot.png)

## Prerequisites

pm2 must allow connections to an external port.  To do this, set the `PM2_BIND_ADDR` environmental variable to `0.0.0.0` before starting pm2.

## To run

Install pm2-web:

```
$ npm install -g pm2-web
```

Then run:

```
$ pm2-web
```

You can specify several command line arguments:

 - `--www:port 9000` This is the port the web interface listens on.
 - `--mdns:name pm2-web` Publish an mdns (Bonjour/Zeroconf) advert with the specified name
 - `--ws:port 9001` The port the websocket that the ui connects to listens on
 - `--updateFrequency 5000` How often in ms we poll pm2 for it's status

### Specifying multiple hosts

By default pm2-web will monitor localhost but you can specify hosts as command line arguments:

```
$ pm2-web --pm2.host localhost --pm2.host another.host --pm2.host yet.another.host
```

### Overriding ports

pm2 listens on a port for RPC connections and publishes events on another so pm2-web needs to connect to them.

You can override the ports pm2-web will try to connect to like so:

```
$ pm2-web --pm2.host localhost --pm2.rpc 6666 --pm2.events 6667
```

And with multiple hosts like so:

```
$ pm2-web --pm2.host localhost --pm2.rpc 6666 --pm2.events 6667 --pm2.host another.host --pm2.rpc 6666 --pm2.events 6667
```

## Credits

Code by [achingbrain](http://github.com/achingbrain), originally based on work done by [dunxrion](https://github.com/dunxrion).

Uses [pm2](https://github.com/unitech/pm2) and [pm2-interface](https://github.com/unitech/pm2-interface) by [unitech](https://github.com/unitech).

Special thanks to [joewalnes](https://github.com/joewalnes) for [reconnecting-websocket](https://github.com/joewalnes/reconnecting-websocket).