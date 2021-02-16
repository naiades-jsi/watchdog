# WatchDog

WatchDog is a utility program that helps monitoring the infrastructure. It can monitor whether certain components are up and running and even check databases for recent data.

## Frontend

Frontend is build using `Angular` and accessible on `http://localhost:5001`. <br>
To start frontend run the following commands:
```
cd frontend
ng serve --open
```

## Endpoints and API

By default Watchdog server is active on `http://localhost:5002`.

### Sources:
* `GET /sources` - returns a list of all sources in JSON format.

* `GET /source/:id` - returns a source with requested `id`.

* `POST /source` - adds a new source to the database, source is send in the request body.

### Types:
* `GET /types` - returns a list of all source types in JSON format.

* `GET /type/:id` - returns a source type with requested `id`.

* `POST /type` - adds a new source type to the database, source type is send in the request body.

### Logs:
* `GET /logs` - returns a list of logs from all sources in JSON format for the last 30 days.

* `GET /log/:id` - returns a log with requested `id`.

* `POST /log` - adds a new log to the database, log is send in the request body.

### Alarms:
* `GET /alarms` - returns a list of all alarms in JSON format.

* `GET /alarm/:id` - returns an alarm with requested `id`.

* `POST /alarm` - adds a new alarm to the database, alarm is send in the request body.