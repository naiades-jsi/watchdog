// watchdog

// includes
// express related includes
let express = require('express');
let bodyParser = require('body-parser');
let cors = require('cors');
let fs = require('fs');
let schedule = require('node-schedule');

// service
let WatchDog = require('./services/watchdog');
let w = new WatchDog();

// parameters
const port = 3001;
const cron_schedule = '*/3 * * * * *'; // every 5 seconds

// variables
let count = 0; // counter for repetitions with no action

// new express app
let app = express();
app.use(cors({origin: 'http://localhost:8000'}));
app.use(bodyParser.json({limit: '50mb'}));

// prepare routes
app.get('/', (req, res) => {
    res.send('Watchdog');
})

// prepare routes
app.get('/ping', async (req, res) => {
    const result = await w.updatePing(req.query.id, req.query.secret);
    if (count) console.log();
    if (result) console.log("Source " + req.query.id + " checked in!");
    else console.log("Wrong credentials for source " + req.query.id + "!");
    count = 0;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(result));
})

// prepare routes
app.get('/status', async (req, res) => {
    const result = await w.storage.getSources();
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(result));
})

// prepare routes
app.get('/alarms', async (req, res) => {
    let n = 10;
    if (req.query.n) n = parseInt(req.query.n);
    const result = await w.storage.getAlarms(n);
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(result));
})

// start server
let server = app.listen(port, 'localhost', () => {
    let host = server.address().address;
    let port = server.address().port;

    console.log("Watchdog listening at http://%s:%s", host, port);
})

// start scheduler
var j = schedule.scheduleJob(cron_schedule, async () => {
    // console.log('Invoking watchdog process');
    w.updateMasterPing();

    // select the source
    let source = await w.selectNextSource();

    // test the source
    // instead of if while can be used and the line
    // with updating source uncommented; not recommended
    // as the system is rather small and pings will be
    // distributed after first iteration
    if (source.diffts > 0) {
        if (count) console.log();
        console.log("Checking: ", source.so_name);
        await w.testSource(source);
        count = 0;
        // source = await w.selectNextSource();
    } else {
        process.stdout.write("*");
        count++;
    };

    // write alarms if needed
});

// start kafka
w.startTestKafka();