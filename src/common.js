const PORT = process.env.PORT;
const WSPORT = process.env.WSPORT;
const MONGO_USER = process.env.MONGO_USER;
const MONGO_PASSWORD = process.env.MONGO_PASSWORD;
const MONGO_CLUSTER = process.env.MONGO_CLUSTER;
const MONGO_DBNAME = process.env.MONGO_DBNAME;
const OPENAI_KEY = process.env.OPENAI_KEY;
const EMAIL_SERVICE = process.env.EMAIL_SERVICE;
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASSWORD = process.env.EMAIL_PASSWORD;

const APP_CONFIG_JSON = JSON.stringify({
    PORT,
    WSPORT,
    MONGO_USER,
    MONGO_PASSWORD,
    MONGO_CLUSTER,
    MONGO_DBNAME,
    OPENAI_KEY,
    EMAIL_SERVICE,
    EMAIL_USER,
    EMAIL_PASSWORD,
}).replace(/"/g, '\\"');

module.exports = {
    PORT,
    WSPORT,
    MONGO_USER,
    MONGO_PASSWORD,
    MONGO_CLUSTER,
    MONGO_DBNAME,
    OPENAI_KEY,
    EMAIL_SERVICE,
    EMAIL_USER,
    EMAIL_PASSWORD,
    APP_CONFIG_JSON,
};