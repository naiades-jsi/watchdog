class LogsRepository {
    constructor(dao){
        this.dao = dao;
    }

    createTable(){
        const sql = `
            CREATE TABLE IF NOT EXISTS logs(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            ts DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
            sourceId INTEGER NOT NULL,
            status VARCHAR NOT NULL)`;

        return this.dao.run(sql);
    }

    create(sourceId, status){
        const sql = `INSERT INTO logs (sourceId, status) VALUES (?, ?)`;
        return this.dao.run(sql, [sourceId, status]);
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

    getAllBySourceId(sourceId){
        const sql = `SELECT * FROM logs
                    WHERE sourceId = ?`;
        return this.dao.all(sql, [sourceId]);
    }

    update(log){
        const { id, ts, sourceId, status } = log;
        const sql = `UPDATE logs
            SET ts = ?, 
            sourceId = ?, 
            status = ? 
            WHERE id = ?`;
        return this.dao.run(sql, [ts, sourceId, status, id]);
    }

    delete(id){
        const sql = `DELETE FROM logs WHERE id = ?`;
        return this.dao.run(sql, [id]);
    }

    deleteAll(){
        const sql = `DELETE FROM logs`;
        return this.dao.run(sql);
    }

    deleteByTimestamp(timestamp){
        const sql = `DELETE FROM logs WHERE ts <= ?`;
        return this.dao.run(sql, [timestamp]);
    }
}

module.exports = LogsRepository;