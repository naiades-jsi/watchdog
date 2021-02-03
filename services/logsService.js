class LogsService {
    constructor(dao){
        this.dao = dao;
    }

    createTable(){
        const sql = `
            CREATE TABLE IF NOT EXISTS logs(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            ts DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
            source_id INTEGER NOT NULL,
            status VARCHAR NOT NULL)`;

        return this.dao.run(sql);
    }

    create(source_id, status){
        const sql = `INSERT INTO logs (source_id, status) VALUES (?, ?)`;
        return this.dao.run(sql, [source_id, status]);
    }

    getById(id){
        const sql = `SELECT * FROM logs 
                    WHERE id = ?`;
        return this.dao.get(sql, [id]);
    }

    getAll(){
        const sql = `SELECT * FROM logs`;
        return this.dao.all(sql);
    }

    update(log){
        const { id, ts, source_id, status } = log;
        const sql = `UPDATE logs
            SET ts = ?, 
            source_id = ?, 
            status = ? 
            WHERE id = ?`;
        return this.dao.run(sql, [ts, source_id, status, id]);
    }

    delete(id){
        const sql = `DELETE FROM logs WHERE id = ?`;
        return this.dao.run(sql, [id]);
    }

    deleteByTimestamp(timestamp){
        const sql = `DELETE FROM logs WHERE ts <= ?`;
        return this.dao.run(sql, [timestamp]);
    }
}

module.exports = LogsService;