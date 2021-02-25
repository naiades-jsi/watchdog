class SourceRepository {
    constructor(dao){
        this.dao = dao;
    }

    createTable(){
        const sql = `
            CREATE TABLE IF NOT EXISTS source(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            ts DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
            name VARCHAR(64) NOT NULL,
            typeId VARCHAR(64) NOT NULL,
            config TEXT NOT NULL,
            lastCheck DATETIME,
            frequency INTEGER NOT NULL,
            lastSuccess DATETIME);`
        return this.dao.run(sql);
    }

    create(name, typeId, config, frequency){
        const sql = `INSERT INTO source (name, typeId, config, frequency) VALUES (?, ?, ?, ?)`;
        return this.dao.run(sql, [name, typeId, config, frequency]);
    }

    getById(id){
        const sql = `SELECT * FROM source
                    WHERE source.id = ?`;
        return this.dao.get(sql, [id]);
    }

    getAll(){
        const sql = `SELECT * FROM source`;
        return this.dao.all(sql);
    }

    getNextSource(){
        const sql = `SELECT * FROM source 
                    WHERE typeId != 'kafkaTopicLastTs' 
                    ORDER BY last_check ASC LIMIT 1`;
        return this.dao.get(sql);
    }

    getKafkaSources(){
        const sql = `SELECT * FROM source 
                    WHERE typeId = 'kafkaTopicLastTs'`;
        return this.dao.all(sql);
    }

    update(source){
        const { id, ts, name, typeId, config, lastCheck, frequency, lastSuccess } = source;
        const sql = `UPDATE source 
            SET ts = ?,
            name = ?,
            typeId = ?,
            config = ?,
            lastCheck = ?,
            frequency = ?,
            lastSuccess = ?
            WHERE id = ?`;
        return this.dao.run(sql, [ts, name, typeId, config, lastCheck, frequency, lastSuccess, id]);
    }

    delete(id){
        const sql = `DELETE FROM source WHERE id = ?`;
        return this.dao.run(sql, [id]);
    }

    deleteAll(){
        const sql = `DELETE FROM source`;
        return this.dao.run(sql);
    }
}

module.exports = SourceRepository;