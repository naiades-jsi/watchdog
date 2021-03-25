const kafka = require('kafka-node');

class Kafka {
    constructor(host, topics, types, sources, sourceRepo, alarmRepo, logsRepo, emailService) {
        this.threshold = 3000; // time ms to update with new measurement
        this.updateTs = Array(sources.length).fill(0);
        this.kafkaHost = host;
        this.topics = topics;
        this.types = types;
        this.sources = sources;
        this.sourceRepo = sourceRepo;
        this.alarmRepo = alarmRepo;
        this.logsRepo = logsRepo;
        this.emailService = emailService;

        this.counter = 0;
        this.connect(host, topics);
    }

    checkSyntaxSemantic(type, message){
        switch(type){
            case 'noise':
                return this.checkNoise(message);
            case 'pressure':
                return this.checkPressure(message);
            case 'weatherObserved':
                return this.checkWeatherObserved(message);
            case 'flow':
                return this.checkFlow(message);
            case 'volume':
                return this.checkVolume(message);
            case 'level':
                return this.checkLevel(message);
            case 'conductivity':
                return this.checkConductivity(message);
            case 'debitmeter':
                return this.checkDebitmeter(message)
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
            if(('time' in rec) && ('leak_state' in rec) &&
                ('noise_db' in rec) && ('spre_db' in rec)) {
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

    checkWeatherObserved(message){
        if(this.checkJson(message)){
            const rec = JSON.parse(message);
            if(('stampm' in rec) && ('pressure' in rec) && ('dew_point' in rec) && 
                ('precipitation' in rec) && ('humidity' in rec) && ('temperature' in rec) &&
                ('wind_bearing' in rec) && ('wind_speed' in rec) && ('illuminance' in rec) &&
                ('pressure_tendency' in rec)){
                return true;
            } else {
                console.log(rec);
                return false;
            }
        }
        return false;
    }

    checkFlow(message){
        if(this.checkJson(message)){
            const rec = JSON.parse(message);
            if(('time' in rec) && ('value' in rec)){
                return true;
            } else {
                return false;
            }
        }
        return false;
    }

    checkVolume(message){
        if(this.checkJson(message)){
            const rec = JSON.parse(message);
            if(('time' in rec) && ('value' in rec)){
                return true;
            } else {
                return false;
            }
        }
        return false;
    }

    checkLevel(message){
        if(this.checkJson(message)){
            const rec = JSON.parse(message);
            if(('time' in rec) && ('value' in rec)){
                return true;
            } else {
                return false;
            }
        }
        return false;
    }

    checkConductivity(message){
        if(this.checkJson(message)){
            const rec = JSON.parse(message);
            if(('time' in rec) && ('value' in rec)){
                return true;
            } else {
                return false;
            }
        }
        return false;
    }

    checkDebitmeter(message){
        if(this.checkJson(message)){
            const rec = JSON.parse(message);
            if(('flow_rate_value' in rec) && ('totalizer1' in rec) && ('totalizer2' in rec) &&
            ('consumer_totalizer' in rec) && ('analog_input1' in rec) && ('analog_input2' in rec) &&
            ('batery_capacity' in rec) && ('alarms_in_decimal' in rec)){
                return true;
            } else {
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
                        source.lastCheck = new Date().add(-1).hour().toString("yyyy-MM-dd HH:mm:ss");
                        source.lastSuccess = source.lastCheck;
                        this.sourceRepo.update(source);
                    } else {
                        console.log('Invalid data on Kafka source ', source.id);

                        await this.logsRepo.create(source.id, "DOWN");
                        source.lastCheck = new Date().add(-1).hour().toString("yyyy-MM-dd HH:mm:ss");
                        this.sourceRepo.update(source);
                        this.alarmRepo.create('Invalid data', source.id, 'Non-JSON or misformatted message on topic');
                        
                        if(this.counter >= 5){
                            this.emailService.sendEmail("Kafka topic error!", 
                            "Invalid data on kafka source " + source.id + "!\nData received: " + msg);

                            this.counter = 0;
                        }
                        this.counter++;
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