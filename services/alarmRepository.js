class AlarmRepository {
    constructor(dao){
        this.dao = dao;
    }

    createTable(){
        const sql = `
            CREATE TABLE IF NOT EXISTS alarms(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            ts DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
            name VARCHAR(64) NOT NULL,
            source_id INTEGER NOT NULL,
            description TEXT NOT NULL)`;
        return this.dao.run(sql);
    }

    create(name, source_id, description){
        const sql = `INSERT INTO alarms (name, source_id, description) VALUES (?, ?, ?)`;
        return this.dao.run(sql, [name, source_id, description]);
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
        const { id, ts, name, source_id, description } = alarm;
        const sql = `UPDATE alarms 
            SET ts = ?,
            name = ?,
            source_id = ?,
            description = ?
            WHERE id = ?`;
        return this.dao.run(sql, [ts, name, source_id, description, id]);
    }

    delete(id){
        const sql = `DELETE FROM alarms WHERE id = ?`;
        return this.dao.run(sql, [id]);
    }
}

module.exports = AlarmRepository;