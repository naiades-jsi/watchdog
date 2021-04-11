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

        this.noiseContent = ['time', 'leak_state', 'noise_db', 'spre_db'];
        this.pressureContent = ['time', 'value'];
        this.weatherObservedContent = ['stampm', 'pressure', 'dew_point', 'precipitation', 'humidity', 'temperature', 'wind_bearing', 'wind_speed', 'illuminance', 'pressure_tendency'];
        this.flowContent = ['time', 'value'];
        this.volumeContent = ['time', 'value'];
        this.levelContent = ['time', 'value'];
        this.conductivityContent = ['time', 'value'];
        this.debitmeterContent = ['flow_rate_value', 'totalizer1', 'totalizer2', 'consumer_totalizer', 'analog_input1', 'analog_input2', 'batery_capacity', 'alarms_in_decimal'];

        this.connect(host, topics);
    }

    getExpectedKafkaContent(type){
        switch(type){
            case 'noise':
                return this.noiseContent;
            case 'pressure':
                return this.pressureContent;
            case 'weatherObserved':
                return this.weatherObservedContent;
            case 'flow':
                return this.flowContent;
            case 'volume':
                return this.volumeContent;
            case 'level':
                return this.levelContent;
            case 'conductivity':
                return this.conductivityContent;
            case 'debitmeter':
                return this.debitmeterContent;
        }
    }

    checkSyntaxSemantic(type, message){
        switch(type){
            case 'noise':
                return this.checkContent(this.noiseContent, message);
            case 'pressure':
                return this.checkContent(this.pressureContent, message);
            case 'weatherObserved':
                return this.checkContent(this.weatherObservedContent, message);
            case 'flow':
                return this.checkContent(this.flowContent, message);
            case 'volume':
                return this.checkContent(this.volumeContent, message);
            case 'level':
                return this.checkContent(this.levelContent, message);
            case 'conductivity':
                return this.checkContent(this.conductivityContent, message);
            case 'debitmeter':
                return this.checkContent(this.debitmeterContent, message);
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

    checkContent(content, message) {
        if(this.checkJson(message)) {
            const rec = JSON.parse(message);
            let counter = 0;
            for(let con of content) {
                if(con in rec) {
                    counter++;
                } else {
                    return false;
                }
            }
            if(counter == content.length) {
                return true;
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
                        source.sendEmail = 0;
                        source.message = msg.value;
                        this.sourceRepo.update(source);
                    } else {
                        console.log('Invalid data on Kafka source ', source.id);

                        await this.logsRepo.create(source.id, "DOWN");
                        source.lastCheck = new Date().add(-1).hour().toString("yyyy-MM-dd HH:mm:ss");
                        
                        if(this.checkJson(source.config) && source.sendEmail == 0){
                            source.sendEmail = 1;

                            const expectedKafkaContent = getExpectedKafkaContent(this.types[index]);
                            const parsedConfig = JSON.parse(source.config);
                            if('email' in parsedConfig) {
                                const email = parsedConfig.email;
                                this.emailService.sendEmail(email, "Kafka topic error!", 
                                        "Invalid data on kafka source " + source.name + " with ID: " + source.id + "!\n" + 
                                        "Expecting kafka topic to have the next values: " + expectedKafkaContent.toString() + ", but received: " + msg);
                            } else {
                                this.emailService.sendEmail("Kafka topic error!", 
                                        "Invalid data on kafka source " + source.name + " with ID: " + source.id + "!\n" + 
                                        "Expecting kafka topic to have the next values: " + expectedKafkaContent.toString() + ", but received: " + msg);
                            }
                        }
                        source.message = msg.value;
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