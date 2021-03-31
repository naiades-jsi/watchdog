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
const LogsRepository = require('./services/logsRepository');
const Watchdog = require('./services/watchdog');

const EmailService = require('./services/emailService');
const emailService = new EmailService();

const dao = new AppDao();
const sourceRepo = new SourceRepository(dao);
const alarmsRepo = new AlarmsRepository(dao);
const logsRepo = new LogsRepository(dao);
const watchdog = new Watchdog(sourceRepo, logsRepo, alarmsRepo, emailService);

/**
 * SERVER configuration
 */
const cron_schedule_ping = '*/30 * * * * *';
const cron_schedule_clean = '0 0 0 * * *';
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

app.get('/db/createSources', (req, res) => {
    sourceRepo.createTable()
        .then((response) => {
            res.send(response);
        });
});

app.get('/db/createAlarms', (req, res) => {
    alarmsRepo.createTable()
        .then((response) => {
            res.send(response);
        });
});

app.get('/db/createLogs', (req, res) => {
    logsRepo.createTable()
        .then((response) => {
            res.send(response);
        });
});

app.get('/db/cleanSources', (req, res) => {
    sourceRepo.deleteAll()
        .then((response) => {
            res.send(response);
        });
});

app.get('/db/cleanAlarms', (req, res) => {
    alarmsRepo.deleteAll()
        .then((response) => {
            res.send(response);
        });
});

app.get('/db/cleanLogs', (req, res) => {
    logsRepo.deleteAll()
        .then((response) => {
            res.send(response);
        });
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

app.get('/sourcesWithoutTopics', (req, res) => {
    sourceRepo.getSourcesWithoutKafkaTopics()
        .then((sources) => {
            res.send(sources);
        })
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
    sourceRepo.create(req.body.name, req.body.typeId, req.body.config, req.body.sendEmail)
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
    alarmsRepo.create(req.body.name, req.body.sourceId, req.body.description)
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
    let availableSources = await sourceRepo.getSourcesWithoutKafkaTopics();
    for(let i = 0; i < availableSources.length; i++){
        watchdog.checkSource(availableSources[i]);
    }
});

/**
 * CRON SCHEDULER for deleting data older than 1 month
 */
const job_clean = schedule.scheduleJob(cron_schedule_clean, async () => {
    const date = new Date().moveToDayOfWeek().addDays(-30).at("01:00:00");
    logsRepo.deleteByTimestamp(date);
});

/**
 * START Kafka
 */
// watchdog.testKafkaTopic();