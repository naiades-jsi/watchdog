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
            type_id INTEGER NOT NULL,
            config TEXT NOT NULL,
            last_check DATETIME,
            frequency INTEGER NOT NULL,
            last_success DATETIME);`
        return this.dao.run(sql);
    }

    create(name, type_id, config, frequency){
        const sql = `INSERT INTO source (name, type_id, config, frequency) VALUES (?, ?, ?, ?)`;
        return this.dao.run(sql, [name, type_id, config, frequency]);
    }

    getById(id){
        const sql = `SELECT * FROM source
                    WHERE id = ?`;
        return this.dao.get(sql, [id]);
    }

    getAll(){
        const sql = `SELECT * FROM source`;
        return this.dao.all(sql);
    }

    update(source){
        const { id, ts, name, type_id, config, last_check, frequency, last_success } = source;
        const sql = `UPDATE source 
            SET ts = ?,
            name = ?,
            type_id = ?,
            config = ?,
            last_check = ?
            frequency = ?,
            last_success = ?
            WHERE id = ?`;
        return this.dao.run(sql, [ts, name, type_id, config, last_check, frequency, last_success, id]);
    }

    delete(id){
        const sql = `DELETE FROM source WHERE id = ?`;
        return this.dao.run(sql, [id]);
    }
}

module.exports = SourceRepository;