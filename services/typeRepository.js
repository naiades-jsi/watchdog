class TypeRepository {
    constructor(dao){
        this.dao = dao;
    }

    createTable(){
        const sql = `CREATE TABLE IF NOT EXISTS type(
            id INTEGER auto increment PRIMARY KEY,
            ts DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
            name VARCHAR(255) NOT NULL)`;
        return this.dao.run(sql);
    }

    create(name){
        const sql = `INSERT INTO type (name) VALUES (?)`;
        return this.dao.run(sql, [name]);
    }

    getById(id){
        const sql = `SELECT * FROM type
                    WHERE id = ?`;
        return this.dao.get(sql, [id]);
    }

    getAll(){
        const sql = `SELECT * FROM type`;
        return this.dao.all(sql);
    }

    update(type){
        const { id, ts, name } = type;
        const sql = `UPDATE type 
            SET ts = ?,
            name = ?
            WHERE id = ?`;
        return this.dao.run(sql, [ts, name, id]);
    }

    delete(id){
        const sql = `DELETE FROM type WHERE id = ?`;
        return this.dao.run(sql, [id]);
    }
}

module.exports = TypeRepository;