# pm2-web
[![Dependency Status](https://david-dm.org/achingbrain/pm2-web.svg?theme=shields.io)](https://david-dm.org/achingbrain/pm2-web) [![devDependency Status](https://david-dm.org/achingbrain/pm2-web/dev-status.svg?theme=shields.io)](https://david-dm.org/achingbrain/pm2-web#info=devDependencies) [![Build Status](https://img.shields.io/travis/achingbrain/pm2-web/master.svg)](https://travis-ci.org/achingbrain/pm2-web) [![Coverage Status](http://img.shields.io/coveralls/achingbrain/pm2-web/master.svg)](https://coveralls.io/r/achingbrain/pm2-web)

A web based monitor for [PM2](https://github.com/Unitech/pm2).

![Screenshot of web monitor](https://raw.github.com/achingbrain/pm2-web/master/assets/screenshot-1.0.png)

## Multiple hosts

With the release of 0.11 pm2 no longer uses TCP sockets for the event bus, instead using unix sockets.  TCP sockets make monitoring hosts remotely possible so that functionality is currently broken.

Hopefully the pm2 team have a solution for this.

## Prerequisites

For debugging to work, [node-inspector](https://www.npmjs.org/package/node-inspector) must be installed and running on the same machine as pm2 (not necessarily the same as pm2-web).

## To run

Install pm2-web:

```
$ npm install -g pm2-web
```

Then run:

```
$ pm2-web
```

## Configuration

All configuration options are documented in the [default configuration file](https://github.com/achingbrain/pm2-web/blob/master/config.json).

pm2-web will load one of the following files if they exist (in order of preference)

 - A file specified by the `--config /path/to/config.json` argument
 - From the current users' home directory: `~/.config/pm2-web/config.json`
 - A global configuration file: `/etc/pm2-web/config.json`

The default configuration file is always loaded and other config files will be applied to the default configuration.

The configuration file(s) loaded and the final configuration object will both be recorded in the logs.

Configuration files are loaded using [cjson](https://www.npmjs.org/package/cjson) so comments are ok.

All options can be passed as command line arguments and will override any settings found in configuration files.

## Authentication

To use HTTP basic auth, set `www:authentication:enabled` to true in your configuration file.  See the [default configuration file](https://github.com/achingbrain/pm2-web/blob/master/config.json) for more information.

N.b. Your password will be sent in plain text.  If you enable HTTP auth, you should probably enable SSL as well.

### SSL support

pm2-web can start a https server if so desired.  To do so, set `www:ssl:enabled` to true in your configuration file and supply your certificate details.  If you do not have a SSL certificate, the `generate_certificate.sh` script in the `/certs` directory will create a self-signed certificate for you.

## Debugging running processes

To debug a running process, [node-inspector](https://www.npmjs.org/package/node-inspector) must be installed and running on the same host as the process.

Specify the port it's running on as the `inspector` property of pm2:host.  E.g.:

```javascript
{
	"pm2": [{
		"host": "foo.baz.com",
		"inspector": 8080
	}]
}
```

You should then see a debug icon appear next to the stop/restart/reload icons when the process is running.

Clicking this icon will send a `SIGUSR1` signal to the process to put it into debug mode and open node-inspector in a new window.

N.b. you may need to change which source file you are looking at in node-inspector to see anything useful.

### Debugging multiple processes

By default node will listen for debugger connections on port 5858. If you attempt to debug multiple processes you must specify different debug ports for them:

```
$ pm2 start --node-args="--debug=7000" foo.js
$ pm2 start --node-args="--debug=7001" bar.js
```

### Debugging multiple instances

This is not possible because:

```
$ pm2 start --node-args="--debug=7000" -i 4 foo.js
```

will start four separate processes all listening on port 7000.

If you are expecting to debug your process, please only start one of them.

## Reload/restart processes

Restarting a process stops the current process and starts a new one, dropping connections in the process.

Reloading starts a new process in the background, killing the old process after the new one has initialised which reduces downtime.

N.b. your process must exit cleanly (e.g. close sockets, database connections) otherwise the old process will never be killed.

### Hard vs soft reloading

Soft reloading (the default) will cause pm2 to send your process a `shutdown` message and kill it shortly afterwards.  Hard reloading will kill it immediately.

To control this behaviour, specify the following in your config file:

```javascript
{
	"forceHardReload": false
}
```

To listen for the `shutdown` event, add the following to your program:

```javascript
process.on("message", function(message) {
	if(message == "shutdown") {
		// do tidy up here
	}
});
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

### 2.0.x
 - Uses 2.x version of pm2-interface, even though it breaks monitoring multiple hosts
 - Shows an error message when attempting to monitor an old/incompatible version of pm2

### 1.6.x

 - Allow reloading of processes as well as restarting
 - Debug button added to use node-inspector to debug running processes
 - Batch UI updates together in an attempt to improve performance
 - Supports http basic auth
 - Supports serving over HTTPS
 - Serve websockets and UI from a single port to make proxying easier

### 1.5.x

 - Introduced external configuration file

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
