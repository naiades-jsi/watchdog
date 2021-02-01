# WatchDog

WatchDog is a utility program that helps monitoring the infrastructure. It can monitor whether certain components are up and running and even check databases for recent data.

Try to remove DB dependencies of Watchdog (flat files only or file-based DB if possible).

> Database access is set up in ```src/common/storage.json```.
> Database setup is performed in ```src/storage/watchdog```. Database gets updated the same way as prediction and raw databases. Check ```src/storage/README.md```.

You can start it with `npm install`, however, it would be worth using PM2 for this and restart the service regularly (i.e. every hour): `pm2 start index.js --restart-delay 3600000`.

## Frontend

Frontend is build using ```Angular``` and accessible on ```http://localhost:4200```. <br>
To start frontend run the following commands:
```
cd frontend
ng serve --open
```

## Endpoints and API

By default Watchdog server is active on ```http://localhost:8080```.

* ```/ping?id=ID&secret=SECRET``` - Register ping by the component. `ID` should be set to the service ID in the database and `SECRET` to the corresponding secret.

Response: returns `true` if checkin was successful, otherswise `false`.

* ```/status``` - Returns JSON encoded status of the system.

Response example:
```
[
    {
        "id": 2,
        "ts": "2019-10-03T20:40:04.000Z",
        "so_name": "GUI",
        "so_typeid": 2,
        "so_config": "{ \"target\": \"http://localhost:8000\" }",
        "so_last": "2019-10-07T08:01:16.000Z",
        "so_frequency": 120,
        "so_last_success": "2019-10-07T08:01:16.000Z",
        "diffts": -67
    },
    ...
]
```

`so_last` in the record returns the last time stamp, when checking of this component was performed. `so_last_success` returns a timestamp, when this check was successful. `diffts` includes delay (in seconds) in checking the component in the current flow.

* ```/alarms?n=N``` - Returns last `N` JSON encoded alarms. Default value for `n` is 10.

Response example:
```
[
    {
        "id": 159,
        "ts": "2019-12-16T16:22:00.000Z",
        "al_name": "Invalid data",
        "al_sourceid": 9,
        "al_description": "Non-JSON or misformatted message on topic"
    },
    ...
]
```

## Components to be monitored
The following components are registed in the system:

* WatchDog (1) - checking master ping
* GUI (2) - `ping`
* GUI-server (3) - `ping`
* Stream Fusion (4) - `pingCheckIn`
* Stream Modelling (5) - `pingCheckIn`
* MariaDB (6) - `socket`
* Kafka (7) - `socket`
* various kafka topics (8+) - `kafkaTopicLastTs`

## Configuration
Configuration is achieved within the MariaDB `watchdog`. Different data sources are registered in the table `source`.

Types of sources can be the following:

* ```master```: `id=1` - Watchdog instance type.
* ```ping```: `id=2` – Active pinging type. Watchdog pings a specified URL, which can check HTTP status code or even JSON response (checking if it is valid).
*	```pingCheckIn```: `id=3` – Passive pinging type. Watchdog implements endpoint /ping, which can be accessed regularly by any component to let watchdog know that the component is still alive.
*	```kafkaTopicLastTs```: `id=4` – Checking last sent kafka data on a particular topic.
*   ```socket```: `id=5` - Checking if we can open socket on a particular port (checking for MariaDB and Kafka).

Each source is identified by the following field:

* `so_name` - user-friendly source name
* `so_typeid` - id of the source type (see list above)
* `so_config` - JSON encoded config of a particular source (see below)
* `so_last` - last timestamp when the source was polled
* `so_frequency` - frequency of polling

Configs (`so_config`) vary by source type:

* `ping` - specify `target` which is the URL to retrieve; if the URL is retrieved with code 200, the ping is considered sucessful
* `pingCheckIn` - specify a `secret` to be used together with `id` when ping callback is being invoked by the target component
* `socket` - specify `target` (IP or address) and `port`; if we are able to connect to the socket at the target port the socket ping is considered successfull
* `kafkaTopicLastTs` - specify `kafka` (server) and `topic` name to which watchdog will listen to; any message on that topic will be consiedered as data; additionally specify `type`, which can be [ `static`, `timevalue` and `weather` ] to check semantics and syntax

*Example configs*
```
{ "target": "http://192.168.99.100:8000" }
{ "secret": "051de32597041e41f73b97d61c67a13b" }
{ "target": "192.168.99.100", "port": 3306 }
{ "target": "192.168.99.100:9092", "topic": "measurements_node_S1", "type": "static" }
```

## Alarms

If invalid data is received in kafka topics according to the type, the alarm will be recored in the alarms table and could be retrieved by invoking `GET /alarms?n=N` request, described above.
