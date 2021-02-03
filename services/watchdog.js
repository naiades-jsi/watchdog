const isReachable = require('is-reachable');

class Watchdog {
    constructor(logsRepository){
        this.logsRepo = logsRepository
    }

    async testCall(){
        const date = new Date();
        console.log("PING! " + date.toLocaleTimeString());
        const res = await this.testSocket();
        console.log(res);
        if(res){
            this.logsRepo.create(2, "UP");
        } else {
            this.logsRepo.create(2, "DOWN");
        }
    }

    async testSocket() {
        // const config = JSON.parse(source.so_config);
        const target = 'localhost'; //config.target;
        const port = 4200; //config.port;

        return await isReachable(target + ":" + port);
    }
        
    async testPing(source) {
        const config = JSON.parse(source.so_config);
        const target = config.target;
        
        return await isReachable(target);
    }
}

module.exports = Watchdog;

// const WatchdogStorage = require('./watchdog_storage_mariadb');
// const isReachable = require('is-reachable');
// const KafkaNode = require('./kafka');

// class Watchdog {

//     constructor() {
//         this.storage = new WatchdogStorage();
//     }

//     async selectNextSource() {
//         const source = await this.storage.getNextSource();
//         return source;
//     }

//     async testSource(source) {
//         let result = false;
//         if (source.ty_name === 'socket') {
//             result = await this.testSocket(source);
//         } else if (source.ty_name === 'ping') {
//             result = await this.testPing(source);
//         }
//         // update source last timestamp
//         await this.storage.updateSource(source.id);
//         if (result) await this.storage.updatePing(source.id);
//         return result;
//     }

//     async testSocket(source) {
//         const config = JSON.parse(source.so_config);
//         const target = config.target;
//         const port = config.port;

//         return await isReachable(target + ":" + port);
//     }

//     async testPing(source) {
//         const config = JSON.parse(source.so_config);
//         const target = config.target;

//         return await isReachable(target);
//     }

//     updatePing(id, secret) {
//         return this.storage.updatePingSecret(id, secret);
//     }

//     updateMasterPing() {
//         this.storage.updateMasterPing();
//     }

//     async startTestKafka() {
//         const topics = await this.storage.getKafkaSources();
//         this.servers = [];
//         // generate topics by server
//         topics.forEach((topic, i) => {
//             const config = JSON.parse(topic.so_config);
//             const idx = this.servers.findIndex((el) => { return el.kafka === config.target});
//             if (idx >= 0) {
//                 this.servers[idx].topics.push(config.topic);
//                 this.servers[idx].types.push(config.type);
//                 this.servers[idx].sourceids.push(topic.id);
//             } else {
//                 this.servers.push({
//                     kafka: config.target,
//                     topics: [ config.topic ],
//                     types: [ config.type ],
//                     sourceids: [ topic.id ]
//                 });
//             }
//         });

//         // connect to servers
//         this.servers.forEach((server, i) => {
//             let kafka = new KafkaNode(server.kafka, server.topics, server.types, this.storage, server.sourceids);
//             this.servers[i].node = kafka;
//         });

//     }
// }

// module.exports = Watchdog;