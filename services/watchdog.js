require('datejs');
const isReachable = require('is-reachable');
const KafkaNode = require('./kafka');

class Watchdog {
    constructor(sourceRepository, logsRepository, alarmsRepository){
        this.sourceRepo = sourceRepository;
        this.logsRepo = logsRepository;
        this.alarmsRepo = alarmsRepository;
    }

    async checkSource(source){
        const date = new Date();
        console.log("PING! " + date.toLocaleTimeString());

        if (source.type_id === 5) {
            const res = await this.testSocket(source);
            if(res){
                await this.logsRepo.create(source.id, "UP");
                source.last_check = new Date().add(-1).hour().toString("yyyy-MM-dd HH:mm:ss");
                source.last_success = source.last_check;
                this.sourceRepo.update(source);
            } else {
                this.logsRepo.create(source.id, "DOWN");
                source.last_check = new Date().add(-1).hour().toString("yyyy-MM-dd HH:mm:ss");
                this.sourceRepo.update(source);
            }
        } else if (source.type_id === 2 || source.type_id === 1) {
            const res = await this.testPing(source);
            if(res){
                await this.logsRepo.create(source.id, "UP");
                source.last_check = new Date().add(-1).hour().toString("yyyy-MM-dd HH:mm:ss");
                source.last_success = source.last_check;
                this.sourceRepo.update(source);
            } else {
                this.logsRepo.create(source.id, "DOWN");
                source.last_check = new Date().add(-1).hour().toString("yyyy-MM-dd HH:mm:ss");
                this.sourceRepo.update(source);
            }
        } else if(source.type_id === 3) {
            await this.logsRepo.create(source.id, "UP");
            source.last_check = new Date().add(-1).hour().toString("yyyy-MM-dd HH:mm:ss");
            source.last_success = source.last_check;
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
            let kafka = new KafkaNode(server.kafka, server.topics, server.types, server.sources, this.sourceRepo, this.alarmsRepo, this.logsRepo);
            this.servers[idx].node = kafka;
        });
    }
}

module.exports = Watchdog;