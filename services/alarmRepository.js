class AlarmRepository {
    constructor(dao){
        this.dao = dao;
        this.createTable();
    }

    createTable(){
        const sql = `
            CREATE TABLE IF NOT EXISTS alarms(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            ts DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
            name VARCHAR(64) NOT NULL,
            sourceId INTEGER NOT NULL,
            description TEXT NOT NULL)`;
        return this.dao.run(sql);
    }

    create(name, sourceId, description){
        const sql = `INSERT INTO alarms (name, sourceId, description) VALUES (?, ?, ?)`;
        return this.dao.run(sql, [name, sourceId, description]);
    }

    getById(id){
        const sql = `SELECT * FROM alarms
                    WHERE id = ?`;
        return this.dao.get(sql, [id]);
    }

    getAll(){
        const sql = `SELECT * FROM alarms`;
        return this.dao.all(sql);
    }

    update(alarm){
        const { id, ts, name, sourceId, description } = alarm;
        const sql = `UPDATE alarms 
            SET ts = ?,
            name = ?,
            sourceId = ?,
            description = ?
            WHERE id = ?`;
        return this.dao.run(sql, [ts, name, sourceId, description, id]);
    }

    delete(id){
        const sql = `DELETE FROM alarms WHERE id = ?`;
        return this.dao.run(sql, [id]);
    }

    deleteAll(){
        const sql = `DELETE FROM alarms`;
        return this.dao.run(sql);
    }
}

module.exports = AlarmRepository;