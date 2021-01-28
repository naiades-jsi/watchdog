const kafka = require('kafka-node');

class Kafka {
    constructor(host, topics, types, storage, sourceids) {
        this.threshold = 3000; // time ms to update with new measurement
        this.updateTs = Array(sourceids.length).fill(0);
        this.kafkaHost = host;
        this.topics = topics;
        this.types = types;
        this.sourceids = sourceids;
        this.storage = storage;
        this.connect(host, topics);
    }

    checkSyntaxSemantics(type, message) {
        switch (type) {
            case "timevalue":
                return this.checkTimeValue(message);
                break;
            case "weather":
                return this.checkWeather(message);
                break;
            case "static":
                return this.checkStatic(message);
                break;
        }
    }

    checkJSON(message) {
        try {
            JSON.parse(message);
            return true;
        } catch(e) {
            console.log(e);
            return false;
        }
    }

    checkWeather(message) {
        if (this.checkJSON(message)) {
            const rec = JSON.parse(message);
            if (
                ("hourly" in rec) && ("data" in rec.hourly) &&
                ("currently" in rec) && ("time" in rec.currently) &&
                (rec.hourly.data.length >= 48)
            ) {
                return true;
            } else {
                return false;
            }
        };

        return false;
    }

    checkTimeValue(message) {
        if (this.checkJSON(message)) {
            const rec = JSON.parse(message);
            if (
                ("time" in rec) && ("value" in rec) &&
                (Number(rec.value) === rec.value)
            ) {
                return true;
            } else {
                console.log(rec);
                return false;
            }
        }

        return false;
    }

    checkStatic(message) {
        if (this.checkJSON(message)) {
            const rec = JSON.parse(message);
            if (
                ("timestamp" in rec) && ("dayBeforeHoliday" in rec) &&
                ("dayAfterHoliday" in rec) && ("dayOfMonth" in rec) &&
                ("dayOfWeek" in rec) && ("dayOfYear" in rec) &&
                ("holiday" in rec) && ("monthOfYear" in rec) &&
                ("weekEnd2" in rec)
            ) {
                return true;
            } else {
                return false;
            }
        }

        return false;
    }

    connect(host, topics) {
        this.client = new kafka.KafkaClient({kafkaHost: host});

        const options = {
            groupId: "kafka-node-watchdog",
            encoding: 'utf8',
            keyEncoding: 'utf8'
        };

        const payloads = topics.map((topic, id) => {
            console.log("Connecting to Kafka topic: ", topic);
            return({
                topic: topic,
            });
        });

        this.consumer = new kafka.Consumer(this.client, payloads, options);

        this.consumer.on('message', async (message) => {
            const id = this.topics.indexOf(message.topic);
            const sourceid = this.sourceids[id];
            try {

                if (Date.now() - this.updateTs[id] > this.threshold) {
                    const success = this.checkSyntaxSemantics(this.types[id], message.value);
                    if (success) {
                        this.updateTs[id] = Date.now();
                        console.log("Updating Kafka source: ", sourceid);
                        await this.storage.updatePing(sourceid);
                    } else {
                        this.storage.addAlarm(sourceid, "Invalid data", "Non-JSON or misformatted message on topic");
                        console.log("Invalid data on Kafka source", sourceid);
                    }
                }

            } catch (err) {
                console.log("Callback error: ", err);
            }
        });

        this.consumer.on('error', (error) => {
            console.log('error', error);
        });
    }
}

module.exports = Kafka;