require('datejs');
const isReachable = require('is-reachable');
const KafkaNode = require('./kafka');

class Watchdog {
    constructor(sourceRepository, logsRepository, alarmsRepository, emailService){
        this.sourceRepo = sourceRepository;
        this.logsRepo = logsRepository;
        this.alarmsRepo = alarmsRepository;
        this.emailService = emailService;
    }

    async checkSource(source){
        const date = new Date();
        console.log("PING! " + date.toLocaleTimeString());

        if (source.typeId === 'socket') {
            const res = await this.testSocket(source);
            if(res){
                await this.logsRepo.create(source.id, "UP");
                source.lastCheck = new Date().add(-1).hour().toString("yyyy-MM-dd HH:mm:ss");
                source.lastSuccess = source.lastCheck;
                source.sendEmail = 0;
                this.sourceRepo.update(source);
            } else {
                this.logsRepo.create(source.id, "DOWN");
                source.lastCheck = new Date().add(-1).hour().toString("yyyy-MM-dd HH:mm:ss");

                let diff = new Date(source.lastCheck) - new Date(source.lastSuccess);
                if((source.lastSuccess != null || diff >= 3600000) && source.sendEmail == 0){
                    source.sendEmail = 1;
                    this.emailService.sendEmail("Source " + source.name + " down!",
                            "There is a problem with source " + source.name + ". Last successful ping was at " + source.lastSuccess + ".");
                }
                this.sourceRepo.update(source);
            }
        } else if (source.typeId === 'ping' || source.typeId === 'master') {
            const res = await this.testPing(source);
            if(res){
                await this.logsRepo.create(source.id, "UP");
                source.lastCheck = new Date().add(-1).hour().toString("yyyy-MM-dd HH:mm:ss");
                source.lastSuccess = source.lastCheck;
                source.sendEmail = 0;
                this.sourceRepo.update(source);
            } else {
                this.logsRepo.create(source.id, "DOWN");
                source.lastCheck = new Date().add(-1).hour().toString("yyyy-MM-dd HH:mm:ss");
                
                let diff = new Date(source.lastCheck) - new Date(source.lastSuccess);
                if((source.lastSuccess == null || diff >= 3600000) && source.sendEmail == 0){
                    source.sendEmail = 1;
                    this.emailService.sendEmail("Source " + source.name + " down!",
                            "There is a problem with source " + source.name + ". Last successful ping was at " + source.lastSuccess + ".");
                }
                this.sourceRepo.update(source);
            }
        } else if(source.typeId === 'pingCheckIn') {
            await this.logsRepo.create(source.id, "UP");
            source.lastCheck = new Date().add(-1).hour().toString("yyyy-MM-dd HH:mm:ss");
            source.lastSuccess = source.lastCheck;
            this.sourceRepo.update(source);
        }
    }

    async testSocket(source) {
        const conf = JSON.parse(source.config);
        const target = conf.target;
        const port = conf.port;

        return await isReachable(target + ":" + port);
    }
        
    async testPing(source) {
        const conf = JSON.parse(source.config);
        const target = conf.target;

        return await isReachable(target);
    }

    async testKafkaTopic(){
        const kafkaSources = await this.sourceRepo.getKafkaSources();
        this.servers = [];

        kafkaSources.forEach((topic, idx) => {
            const config = JSON.parse(topic.config);
            const index = this.servers.findIndex((el) => { return el.kafka === config.target});
            if(index >= 0){
                this.servers[index].topics.push(config.topic);
                this.servers[index].types.push(config.type);
                this.servers[index].sources.push(topic);
            } else {
                this.servers.push({
                    kafka: config.target,
                    topics: [config.topic],
                    types: [config.type],
                    sources: [topic]
                });
            }
        });
        console.log(this.servers);

        // connect to servers
        this.servers.forEach((server, idx) => {
            let kafka = new KafkaNode(server.kafka, server.topics, server.types, server.sources, this.sourceRepo, this.alarmsRepo, this.logsRepo, this.emailService);
            this.servers[idx].node = kafka;
        });
    }
}

module.exports = Watchdog;