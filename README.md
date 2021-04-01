# WatchDog

WatchDog is a utility program that helps monitoring the infrastructure. It can monitor whether certain components are up and running and even check databases for recent data.

The purpose of this application is to check weather some components like server, frontend, api, kafka host or zookeeper are up and running. In case any of the sources is down for more than 1 hour, the administrator recives an email about the issue. There are also automatically generated charts that show UP/DOWN time for each of the sources for the last 30 days. After that the data automatically gets deleted. At the bottom of the page we have a table, where we can see alarms that get triggered in the application if something is not okay.
This application is build out of two parts frontend build with `angular 11` and backend server with API endpoints build with `node` and `express`. For data storing we use sqlite database that automatically builds when we start the server. We have 3 data objects we work with. The first is source, that stores information about source we want to check if it is working. Types of sources are `master`, `ping`, `socket`, `pingCheckIn` and `kafkaTopicLastTs`. Source object also has a `config` attribute, in JSON format, in which we store the data needed to check the source (target url, port, etc). The next entity is `Alarm` that contains information if something goes wrong with any source. Alarms are displayed in a sortable table that automatically updates. The last entity is `Log` that contains the information if the source is `UP` and running or `DOWN`. For all communication with database use appropriate repository.

## Starting the watchdog

First we need to start the server with the following commands: <br>
```
cd watchdog
npm install
node index.js
```
For the frontend we need to run:
```
cd watchdog/frontend
npm install
ng serve --open
```
The server with API endpoints is accessible at `http://localhost:5001` and the frontend is accessible on `http://localhost:5002`.

## Future work
The plan is to finish also the subpage where will be displayed all the kafka topics if they are UP or DOWN similar to sources, but without the charts. Also it would be very good to have an option to check what kind of data are running on a specific kafka topic. Most of the backend for checking kafka topics is already implemented.