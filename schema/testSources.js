const sources = [
    {
        name: 'WatchDog server',
        type_id: 1,
        config: '{ "target": "http://localhost:8080"}',
        frequency: 1
    },{
        name: 'Watchdog Frontend',
        type_id: 2,
        config: '{ "target": "http://localhost:4200" }',
        frequency: 120
    },{
        name: 'Kafka',
        type_id: 5,
        config: '{ "target": "192.168.82.187", "port": 9092 }',
        frequency: 60
    },{
        name: 'Zookeeper',
        type_id: 5,
        config: '{ "target": "192.168.82.187", "port": 2181 }',
        frequency: 60
    },{
        name: 'Kafka topic - S1',
        type_id: 4,
        config: '{ "target": "192.168.82.187:9092", "topic": "measurements_node_S1", "type": "static" }',
        frequency: 120
    },{
        name: 'Kafka topic - N1',
        type_id: 4,
        config: '{ "target": "192.168.82.187:9092", "topic": "measurements_node_N1", "type": "timevalue" }',
        frequency: 120
    },{
        name: 'Kafka topic - W1',
        type_id: 4,
        config: '{ "target": "192.168.82.187:9092", "topic": "measurements_node_W1", "type": "weather" }',
        frequency: 120
    }
];

module.exports = { sources };