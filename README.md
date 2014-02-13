# pm2-web
[![Dependency Status](https://david-dm.org/achingbrain/pm2-web.svg?theme=shields.io)](https://david-dm.org/achingbrain/pm2-web) [![devDependency Status](https://david-dm.org/achingbrain/pm2-web/dev-status.svg?theme=shields.io)](https://david-dm.org/achingbrain/pm2-web#info=devDependencies) [![Build Status](https://img.shields.io/travis/achingbrain/pm2-web/master.svg)](https://travis-ci.org/achingbrain/pm2-web) [![Coverage Status](http://img.shields.io/coveralls/achingbrain/pm2-web/master.svg)](https://coveralls.io/r/achingbrain/pm2-web)

A web based monitor for [PM2](https://github.com/Unitech/pm2).

![Screenshot of web monitor](https://raw.github.com/achingbrain/pm2-web/master/assets/screenshot-1.0.png)

## Prerequisites

pm2 must allow connections to an external port.  To do this, set the `$PM2_BIND_ADDR` environmental variable to `0.0.0.0` on the host you wish to monitor before starting pm2.

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

### Resource usage graphs

You can tweak the resource usage graph to be more or less specific.  The thinking here is that lots of processes with lots of process usage data will make your browser a bit crashey.

By default it will retain 1000 resource usage measurements of a process (CPU and memory) over a maximum of five days with 40% of the measurements taken in the last 24 hours, 25% from the day before, 10% each from the two days before that and 5% from the day before that.

The update frequency of the graph is controlled by `--updateFrequency` as detailed above.

```
--graph.datapoints 1000
```

The number of data points that will be plotted on the graph in total.  If you've got a lot of processes, you may wish to set this to a lowish number to minimise memory consumption in your browser and the pm2-web process itself.

```
--graph.distribution 40 --graph.distribution 25 --graph.distribution 10 --graph.distribution 10 --graph.distribution 5
```

The number of `--graph.distribution` arguments is the number of days worth of data to graph (default 5) and the value is what percentage of `--graph.datapoints` should be plotted on a given day (the first `--graph.distribution` argument is today, the second is yesterday, etc).

What this means is that any recent resource usage data will have a more accurate representation in the graph at the cost of consuming more memory and older data will be less accurate but also less likely to crash your browser.

### Logs

pm2-web will display log lines emitted by monitored processes after pm2-web itself was started.  In order to keep resource usage reasonable by default it will show 1000 log lines.

You can alter this behaviour by specifying `--logs:max`, so for example to lower this to 500 lines:

```
--logs:max 500
```

## Release notes

### 1.4.x

 - Swapped d3/xCharts for HighCharts due to a memory leak

### 1.3.x

 - Display logs from processes emitted after pm2-web was started
 - Caches logging output between browser refreshes
 - Respects ANSI colour in logging output

### 1.2.x

 - Must have been something interesting here

### 1.1.x

 - Displays graphs of memory and cpu output

### 1.0.x

 - Initial release
 - Process listing
 - Restarting, stopping & starting processes

## Credits

Code by [achingbrain](http://github.com/achingbrain), originally based on work done by [dunxrion](https://github.com/dunxrion).

Uses [pm2](https://github.com/unitech/pm2) and [pm2-interface](https://github.com/unitech/pm2-interface) by [unitech](https://github.com/unitech).

Special thanks to [joewalnes](https://github.com/joewalnes) for [reconnecting-websocket](https://github.com/joewalnes/reconnecting-websocket) and [Luegg](https://github.com/Luegg) for [angularjs-scroll-glue](https://github.com/Luegg/angularjs-scroll-glue).
