const fetch = require('node-fetch');
const schedule = require('node-schedule');
const cron_schedule_ping = '*/30 * * * * *';

// ping WATCHDOG with scheduler
const job = schedule.scheduleJob(cron_schedule_ping, async () => {
    console.log("Checking into WatchDog");
    fetch('http://localhost:5002/pingCheckIn/Test-nodePing')
        .then(res => {
            if(res.ok) {
                console.log("Ping was successful!");
            }
        });
});