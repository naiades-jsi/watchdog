/**
 * WATCHDOG server
 */
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const AppDao = require('./services/dao');
const SourceRepository = require('./services/sourceRepository');
const AlarmsRepository = require('./services/alarmRepository');
const TypeRepository = require('./services/typeRepository');

const dao = new AppDao();
const sourceRepo = new SourceRepository(dao);
const alarmsRepo = new AlarmsRepository(dao);
const typeRepo = new TypeRepository(dao);

/**
 * DATABASE initialization
 */
sourceRepo.createTable()
    .then(() => alarmsRepo.createTable())
    .then(() => typeRepo.createTable());

/**
 * SERVER configuration
 */
const HTTP_PORT = 8080;
const app = express();
app.listen(HTTP_PORT, () => {
    console.log("Server running on port %PORT%".replace("%PORT%",HTTP_PORT))
});
app.use(cors({origin: 'http://localhost:4200'}));
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

app.get('/source/:id', (req, res) => {
    sourceRepo.getById(req.params)
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
    alarmsRepo.getById(req.params)
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
    typeRepo.getById(req.params)
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