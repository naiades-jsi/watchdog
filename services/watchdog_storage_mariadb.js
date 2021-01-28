let mariadb = require('mariadb');

class MariaDBWatchdogStorageService {

    constructor() {
        this.config = require('../../common/storage.json').watchdog;
        this.debug = false;
    }

    async updateMasterPing() {
        await this.updatePing(1);
    }

    async updatePing(id) {
        let conn;
        let pool;

        try {
            let query = 'update source set so_last_success = now() where id = ' + id;
            if (this.debug) console.log("Executing query: " + query);

            pool = mariadb.createPool({
                host: this.config.host,
                user: 'root',
                password: this.config.root_password,
                multipleStatements: true
            });

            conn = await pool.getConnection();
            await conn.query('use watchdog');
            await conn.query(query);

            return true;
        } catch(err) {
            console.log(err);
            throw(err);
        } finally {
            if (conn) conn.end();
            if (pool) pool.end();
        }
    }

    async updatePingSecret(id, secret) {
        let conn;
        let pool;

        try {
            let query = 'select so_config from source where id = ' + id;
            if (this.debug) console.log("Executing query: " + query);

            pool = mariadb.createPool({
                host: this.config.host,
                user: 'root',
                password: this.config.root_password,
                multipleStatements: true
            });

            await this.updateSource(id);

            conn = await pool.getConnection();
            await conn.query('use watchdog');
            const result = await conn.query(query);
            const config = JSON.parse(result[0].so_config);
            if (config.secret === secret) {
                await this.updatePing(id);
                return true;
            }
            return false;
        } catch(err) {
            console.log(err);
            throw(err);
        } finally {
            if (conn) conn.end();
            if (pool) pool.end();
        }
    }

    async getSources() {
        let conn;
        let pool;

        try {
            let query = `select
                *,
                unix_timestamp(NOW()) - unix_timestamp(so_last) - so_frequency as diffts
            from source`;

            if (this.debug) console.log("Executing query: " + query);

            pool = mariadb.createPool({
                host: this.config.host,
                user: 'root',
                password: this.config.root_password,
                multipleStatements: true
            });
            conn = await pool.getConnection();
            await conn.query('use watchdog');
            let rows = await conn.query(query);
            delete(rows.meta);
            return rows;
        } catch (err) {
            console.log(err);
            throw(err);
        } finally {
            if (conn) conn.end();
            if (pool) pool.end();
            // return null;
        }
    }

    async getKafkaSources() {
        const sources = await this.getSources();
        return sources.filter((source) => { return source.so_typeid === 4});
    }

    async getNextSource() {
        let conn;
        let pool;

        try {
            let query = `select
                *,
                unix_timestamp(NOW()) - unix_timestamp(so_last) - so_frequency as diffts
            from type, source
            where
                type.id = source.so_typeid and
                ty_name != 'master' and
                ty_name != 'pingCheckIn' and
                ty_name != 'kafkaTopicLastTs'
            order by diffts desc
            limit 1`;

            if (this.debug) console.log("Executing query: " + query);

            pool = mariadb.createPool({
                host: this.config.host,
                user: 'root',
                password: this.config.root_password,
                multipleStatements: true
            });
            conn = await pool.getConnection();
            await conn.query('use watchdog');
            let rows = await conn.query(query);
            delete(rows.meta);
            return rows[0];
        } catch (err) {
            console.log(err);
            throw(err);
        } finally {
            if (conn) conn.end();
            if (pool) pool.end();
            // return null;
        }
    }

    async updateSource(id) {
        let conn;
        let pool;

        try {
            let query = 'update source set so_last = current_timestamp() where id = ' + id;

            if (this.debug) console.log("Executing query: " + query);

            pool = mariadb.createPool({
                host: this.config.host,
                user: 'root',
                password: this.config.root_password,
                multipleStatements: true
            });
            conn = await pool.getConnection();
            await conn.query('use watchdog');
            await conn.query(query);
        } catch (err) {
            console.log(err);
            throw(err);
        } finally {
            if (conn) conn.end();
            if (pool) pool.end();
            // return null;
        }
    }

    async addAlarm(sourceid, name, description) {
        let conn;
        let pool;

        try {
            let query = 'insert into alarms (al_sourceid, al_name, al_description) values (?, ?, ?)';

            if (this.debug) console.log("Executing query: " + query);

            pool = mariadb.createPool({
                host: this.config.host,
                user: 'root',
                password: this.config.root_password,
                multipleStatements: true
            });
            conn = await pool.getConnection();
            await conn.query('use watchdog');
            await conn.query(query, [ sourceid, name, description ]);
        } catch (err) {
            console.log(err);
            throw(err);
        } finally {
            if (conn) conn.end();
            if (pool) pool.end();
            // return null;
        }
    }

    async getAlarms(n) {
        let conn;
        let pool;

        try {
            let query = 'select * from alarms order by ts desc limit ?';

            if (this.debug) console.log("Executing query: " + query);

            pool = mariadb.createPool({
                host: this.config.host,
                user: 'root',
                password: this.config.root_password,
                multipleStatements: true
            });
            conn = await pool.getConnection();
            await conn.query('use watchdog');
            let rows = await conn.query(query, [ n ]);
            delete(rows.meta);
            return rows;
        } catch (err) {
            console.log(err);
            throw(err);
        } finally {
            if (conn) conn.end();
            if (pool) pool.end();
            // return null;
        }
    }

}

module.exports = MariaDBWatchdogStorageService;