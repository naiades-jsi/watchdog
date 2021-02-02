const sources = [
    {
        name: 'WatchDog',
        type_id: 1,
        config: '',
        frequency: 1
    },{
        name: 'GUI',
        type_id: 2,
        config: '{ "target": "http://localhost:8000" }',
        frequency: 120
    },{
        name: 'GUI-server',
        type_id: 2,
        config: '{ "target": "http://localhost:3000" }',
        frequency: 120
    },{
        name: 'StreamFusion',
        type_id: 3,
        config: '{ "secret": "051de32597041e41f73b97d61c67a13b" }',
        frequency: 60
    },{
        name: 'StreamModelling',
        type_id: 3,
        config: '{ "secret": "b9347c25aba4d3ba6e8f61d05fd1c011" }',
        frequency: 60
    },{
        name: 'MariaDB',
        type_id: 5,
        config: '{ "target": "localhost", "port": 3306 }',
        frequency: 60
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