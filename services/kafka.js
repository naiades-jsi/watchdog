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
        this.flowContentBraila = ['time', 'flow_rate_value', 'totalizer1', 'totalizer2', 'consumer_totalizer', 'analog_input1', 'analog_input2', 'batery_capacity', 'alarms_in_decimal'];
        this.volumeContent = ['time', 'value'];
        this.levelContent = ['time', 'value'];
        this.conductivityContent = ['time', 'value'];
        this.debitmeterContent = ['flow_rate_value', 'totalizer1', 'totalizer2', 'consumer_totalizer', 'analog_input1', 'analog_input2', 'batery_capacity', 'alarms_in_decimal'];
        this.moistureContent = ['time', 'value'];
        this.brailaPressureAD = ['timestamp', 'status', 'status_code', 'value', 'algorithm'];
        this.brailaNightFlowAD = ['timestamp', 'status', 'status_code', 'value', 'algorithm'];
        this.alicanteSalinityAD = ['sensor', 'algorithm', 'score', 'timestamp', 'explanation'];

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
            case 'flowBraila':
                return this.flowContentBraila;
            case 'soilMoisture':
                return this.moistureContent;
            case 'brailaPressureAD':
                return this.brailaPressureAD;
            case 'brailaNightFlowAD':
                return this.brailaNightFlowAD;
            case 'alicanteSalinityAD':
                return this.alicanteSalinityAD;
            default:
                return 'This type does not exist!';
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
            case 'flowBraila':
                return this.checkContent(this.flowContentBraila, message);
            case 'volume':
                return this.checkContent(this.volumeContent, message);
            case 'level':
                return this.checkContent(this.levelContent, message);
            case 'conductivity':
                return this.checkContent(this.conductivityContent, message);
            case 'debitmeter':
                return this.checkContent(this.debitmeterContent, message);
            case 'soilMoisture':
                return this.checkContent(this.moistureContent, message);
            case 'brailaPressureAD':
                return this.checkContent(this.brailaPressureAD, message);
            case 'brailaNightFlowAD':
                return this.checkContent(this.brailaNightFlowAD, message);
            case 'alicanteSalinityAD':
                return this.checkContent(this.alicanteSalinityAD, message);
        }
    }

    checkJson(message){
        try {
            JSON.parse(JSON.stringify(message));
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
        // console.log(host)
        this.client = new kafka.KafkaClient({kafkaHost: host, requestTimeout: 60000});
        this.offset = new kafka.Offset(this.client);

        const options = {
            groupId: 'kafka-node-watchdog'
        };

        const payloads = topics.map((topic, id) => {
            console.log('Connecting to Kafka topic: ', topic);
            return { 
                topic: topic,
                partition: 0
            };
        });

        this.consumer = new kafka.Consumer(this.client, payloads, options);

        this.consumer.on('message', (msg) => {
            // console.log('MESSAGE received ' + msg);
            const index = this.topics.indexOf(msg.topic);
            const source = this.sources[index];

            // console.log(this.topics + " " + index);
            // console.log(this.sources + " " + source);
            try {
                if(Date.now() - this.updateTs[index] > this.threshold) {
                    const success = this.checkSyntaxSemantic(this.types[index], msg.value);
                    // console.log("IS SUCCESS? " + success);
                    if(success){
                        this.updateTs[index] = Date.now();
                        
                        this.logsRepo.create(source.id, "UP");
                        source.lastCheck = new Date().add(-1).hour().toString("yyyy-MM-dd HH:mm:ss");
                        source.lastSuccess = source.lastCheck;
                        source.sendEmail = 0;
                        source.message = msg.value;
                        // console.log("SAVING SOURCE " + source);
                        this.sourceRepo.update(source);
                    } else {
                        console.log('Invalid data on Kafka source ', source.id);
                        const expectedKafkaContent = this.getExpectedKafkaContent(this.types[index]);
                        this.logsRepo.create(source.id, "DOWN");
                        source.lastCheck = new Date().add(-1).hour().toString("yyyy-MM-dd HH:mm:ss");

                        if(this.checkJson(source.config) && source.sendEmail == 0){
                            source.sendEmail = 1;

                            const parsedConfig = JSON.parse(source.config);
                            if('email' in parsedConfig) {
                                const email = parsedConfig.email;
                                console.log("Sending email to " + email + " " + parsedConfig);
                                this.emailService.sendEmail(email, "Kafka topic error!", 
                                        "Invalid data on kafka source " + source.name + " with ID: " + source.id + "!\n" + 
                                        "Expecting kafka topic to have the next values: " + expectedKafkaContent.toString() + ", but received: " + msg);
                            } else {
                                console.log("Sending email to admin");
                                this.emailService.sendEmail("Kafka topic error!", 
                                        "Invalid data on kafka source " + source.name + " with ID: " + source.id + "!\n" + 
                                        "Expecting kafka topic to have the next values: " + expectedKafkaContent.toString() + ", but received: " + msg);
                            }
                        }
                        source.message = msg.value;
                        this.sourceRepo.update(source);
                        this.alarmRepo.create('Invalid data', source.name, "Invalid data on kafka source " + source.name + " with ID: " + source.id + "!\n" + 
                                                                                "Expecting kafka topic to have the next values: " + expectedKafkaContent.toString() + ", but received: " + msg);
                    }
                }
            } catch(e){
                this.emailService.sendEmail("Kafka callback error exception", e);
                console.log('Kafka callback error exception:', e);
            }
        });

        this.consumer.on('error', (err) => {
            this.emailService.sendEmail("Error", err);
            console.log('Error:', err);
            console.log(this.consumer);
            console.log(err.topic);
        });

        this.consumer.on('offsetOutOfRange', (kafkaCons) => {
            this.offset.fetch([kafkaCons], (err, offsets) => {
                if(err) {
                    const index = this.topics.indexOf(kafkaCons.topic);
                    const source = this.sources[index];
                    this.alarmRepo.create('Kafka offset error', source.id, 
                    'An error occured while trying to get the offset for topic' + kafkaCons.topic + ". Error: " + err);
                    return console.log(err);
                }
                let minOffset = Math.min(offsets[kafkaCons.topic][kafkaCons.partition]);
                this.consumer.setOffset(kafkaCons.topic, kafkaCons.partition, minOffset);
            });
        });
    }
}

module.exports = Kafka;