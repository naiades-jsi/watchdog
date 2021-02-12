require('datejs');
const isReachable = require('is-reachable');

class Watchdog {
    constructor(sourceRepository, logsRepository){
        this.sourceRepo = sourceRepository;
        this.logsRepo = logsRepository;
    }

    async checkSource(source){
        const date = new Date();
        console.log("PING! " + date.toLocaleTimeString());
        console.log(source);

        if (source.type_id === 5) {
            res = await this.testSocket(source);
            if(res){
                await this.logsRepo.create(source.id, "UP");
                source.last_check = new Date().add(-1).hour().toString("yyyy-MM-dd HH:mm:ss");
                source.last_success = source.last_check;
                this.sourceRepo.update(source);
            } else {
                await this.logsRepo.create(source.id, "DOWN");
                source.last_check = new Date().add(-1).hour().toString("yyyy-MM-dd HH:mm:ss");
                this.sourceRepo.update(source);
            }
        } else if (source.type_id === 2 || source.type_id === 1) {
            res = await this.testPing(source);
            if(res){
                await this.logsRepo.create(source.id, "UP");
                source.last_check = new Date().add(-1).hour().toString("yyyy-MM-dd HH:mm:ss");
                source.last_success = source.last_check;
                this.sourceRepo.update(source);
            } else {
                await this.logsRepo.create(source.id, "DOWN");
                source.last_check = new Date().add(-1).hour().toString("yyyy-MM-dd HH:mm:ss");
                this.sourceRepo.update(source);
            }
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

    async testKafkaTopic(source){
        
    }
}

module.exports = Watchdog;