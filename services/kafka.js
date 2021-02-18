const kafka = require('kafka-node');

class Kafka {
    constructor(host, topics, types, sources, sourceRepo, alarmRepo, logsRepo) {
        this.threshold = 3000; // time ms to update with new measurement
        this.updateTs = Array(sources.length).fill(0);
        this.kafkaHost = host;
        this.topics = topics;
        this.types = types;
        this.sources = sources;
        this.sourceRepo = sourceRepo;
        this.alarmRepo = alarmRepo;
        this.logsRepo = logsRepo;
        this.connect(host, topics);
    }

    checkSyntaxSemantic(type, message){
        switch(type){
            case 'noise':
                return this.checkNoise(message);
            case 'pressure':
                return this.checkPressure(message);
            case 'weather':
                return this.checkWeather(message);
        }
    }

    checkJson(message){
        try {
            JSON.parse(message);
            return true;
        } catch(e){
            console.log(e);
            return false;
        }
    }

    checkNoise(message){
        if(this.checkJson(message)){
            const rec = JSON.parse(message);
            if(('time' in rec) && 
                ('leak_state' in rec) &&
                ('noise_dB' in rec) && 
                ('spre_dB' in rec)) {
                return true;
            } else {
                console.log(rec);
                return false;
            }
        }
        return false;
    }

    checkPressure(message){
        if(this.checkJson(message)){
            const rec = JSON.parse(message);
            if(('time' in rec) && ('value' in rec)){
                return true;
            } else {
                console.log(rec);
                return false;
            }
        }
        return false;
    }

    checkWeather(message){
        if(this.checkJson(message)){
            const rec = JSON.parse(message);
            if(('time' in rec) && ('pressure' in rec) && ('dewPoint' in rec) && 
                ('humidity' in rec) && ('temperature' in rec) && ('windBearing' in rec) &&
                ('windspeed' in rec) && ('illuminance' in rec) && ('pressureTendency' in rec)){
                return true;
            } else {
                console.log(rec);
                return false;
            }
        }
        return false;
    }

    connect(host, topics){
        this.client = new kafka.KafkaClient({kafkaHost: host});

        const options = {
            groupId: 'kafka-node-watchdog',
            encoding: 'utf8',
            keyEncoding: 'utf8'
        };

        const payloads = topics.map((topic, id) => {
            console.log('Connecting to Kafka topic: ', topic);
            return({ topic: topic });
        });

        this.consumer = new kafka.Consumer(this.client, payloads, options);

        this.consumer.on('message', async (msg) => {
            const index = this.topics.indexOf(msg.topic);
            const source = this.sources[index];

            try{
                if(Date.now() - this.updateTs[index] > this.threshold) {
                    const success = this.checkSyntaxSemantic(this.types[index], msg.value);

                    if(success){
                        this.updateTs[index] = Date.now();
                        console.log('Updating Kafka source: ', source.id);

                        await this.logsRepo(source.id, "UP");
                        source.last_check = new Date().add(-1).hour().toString("yyyy-MM-dd HH:mm:ss");
                        source.last_success = source.last_check;
                        this.sourceRepo.update(source);
                    } else {
                        console.log('Invalid data on Kafka source ', source.id);

                        await this.logsRepo.create(source.id, "DOWN");
                        source.last_check = new Date().add(-1).hour().toString("yyyy-MM-dd HH:mm:ss");
                        this.sourceRepo.update(source);
                        this.alarmRepo.create('Invalid data', source.id, 'Non-JSON or misformatted message on topic');
                    }
                }
            } catch(e){
                console.log('Kafka callback error: ', err);
            }
        });

        this.consumer.on('error', (err) => {
            console.log('Error: ', err);
        });
    }
}

module.exports = Kafka;