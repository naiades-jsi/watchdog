/**
 * WATCHDOG server
 */
require('datejs');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const schedule = require('node-schedule');
const dotenv = require('dotenv');
dotenv.config();

const AppDao = require('./services/dao');
const SourceRepository = require('./services/sourceRepository');
const AlarmsRepository = require('./services/alarmRepository');
const TypeRepository = require('./services/typeRepository');
const LogsRepository = require('./services/logsRepository');
const Watchdog = require('./services/watchdog');

const {sources} = require('./schema/testSources.js');
const {types} = require('./schema/testTypes');

const EmailService = require('./services/emailService');
const emailService = new EmailService();

const dao = new AppDao();
const sourceRepo = new SourceRepository(dao);
const alarmsRepo = new AlarmsRepository(dao);
const typeRepo = new TypeRepository(dao);
const logsRepo = new LogsRepository(dao);
const watchdog = new Watchdog(sourceRepo, logsRepo, alarmsRepo);

/**
 * DATABASE initialization
 */
// sourceRepo.createTable()
//     .then(() => alarmsRepo.createTable())
//     .then(() => typeRepo.createTable())
//     .then(() => logsRepo.createTable());

// sources.forEach(el => {
//     sourceRepo.create(el.name, el.type_id, el.config, el.frequency);
// });

// types.forEach(el => {
//     typeRepo.create(el.name);
// });

/**
 * SERVER configuration
 */
const cron_schedule_ping = '*/5 * * * * *';
const cron_schedule_clean = '0 0 0 * * *'
const app = express();
app.listen(process.env.HTTP_PORT, () => {
    console.log("Server running on port %PORT%".replace("%PORT%", process.env.HTTP_PORT))
});
app.use(cors({origin: process.env.FRONT_URL}));
app.use(bodyParser.json({limit: '50mb'}));

/**
 * ENDPOINTS
 */
app.get('/', (req, res) => {
    res.send('Watchdog');
});

app.get('/ping', (req, res) => {
    res.status(200).send('Pong!');
});

/**
 * SOURCES
 */
app.get('/sources', (req, res) => {
    sourceRepo.getAll()
        .then((sources) => {
            res.send(sources);
        });
});

app.get('/sourcesKafka', (req, res) => {
    sourceRepo.getKafkaSources()
        .then((kafkaSources) => {
            res.send(kafkaSources);
        });
});

app.get('/source/:id', (req, res) => {
    sourceRepo.getById(req.params.id)
        .then((source) => {
            res.send(source);
        });
});

app.post('/source', (req, res) => {
    sourceRepo.create(req.body.name, req.body.type_id, req.body.config, req.body.frequency)
        .then((response) => {
            res.send(response);
        });
});

/**
 * ALARMS
 */
app.get('/alarms', (req, res) => {
    alarmsRepo.getAll()
        .then((alarms) => {
            res.send(alarms);
        });
});

app.get('/alarm/:id', (req, res) => {
    alarmsRepo.getById(req.params.id)
        .then((alarm) => {
            res.send(alarm);
        });
});

app.post('/alarm', (req, res) => {
    alarmsRepo.create(req.body.name, req.body.source_id, req.body.description)
        .then((response) => {
            res.send(response);
        });
});

/**
 * TYPE
 */
app.get('/types', (req, res) => {
    typeRepo.getAll()
        .then((types) => {
            res.send(types);
        });
});

app.get('/type/:id', (req, res) => {
    typeRepo.getById(req.params.id)
        .then((type) => {
            res.send(type);
        });
});

app.post('/type', (req, res) => {
    typeRepo.create(req.body.name)
        .then((response) => {
            res.send(response);
        });
});

/**
 * LOGS
 */
app.get('/logs', (req, res) => {
    logsRepo.getAll()
        .then((types) => {
            res.send(types);
        });
});

app.get('/logs/source/:id', (req, res) => {
    logsRepo.getAllBySourceId(req.params.id)
        .then((logs) => {
            res.send(logs);
        });
});

app.get('/log/:id', (req, res) => {
    logsRepo.getById(req.params.id)
        .then((type) => {
            res.send(type);
        });
});

app.post('/log', (req, res) => {
    logsRepo.create(req.body.name)
        .then((response) => {
            res.send(response);
        });
});

/**
 * CRON SCHEDULER for checking if system is working
 */
const job = schedule.scheduleJob(cron_schedule_ping, async () => {
    let nextSource = await sourceRepo.getNextSource();
    watchdog.checkSource(nextSource);
});

/**
 * CRON SCHEDULER for deleting data older than 1 month
 */
const job_clean = schedule.scheduleJob(cron_schedule_clean, async () => {
    // FOR NOW IT DELETES OLD DATA EVERY MINUTE
    const date = new Date();
    
    const newDate = new Date(date - 20000).add(-1).hour().toString("yyyy-MM-dd HH:mm:ss");
    logsRepo.deleteByTimestamp(newDate);
});

/**
 * START Kafka
 */
// watchdog.testKafkaTopic();