const dotenv = require('dotenv').config();
const mongoose = require('mongoose');
const mysql = require('mysql2');

let mongodb;
let mysqldb;

const setup = async () => {
    if (mongodb && mysqldb) {
        return { mongodb, mysqldb };
    }

    try {
        // MongoDB 연결 설정
        const mongoDbUrl = process.env.MONGO_DB_URL;
        const mongoDbName = process.env.MONGO_DB;

        if (!mongoDbUrl || !mongoDbName) {
            throw new Error("MongoDB 접속 정보가 환경 변수에 설정되지 않았습니다.");
        }

        // MongoDB 연결
        const mongoConn=await mongoose.connect(mongoDbUrl, {
            dbName: mongoDbName,
        });

        mongodb = mongoose.connection;
        console.log("몽고DB 접속 성공");

        // MySQL 연결 설정
        const mysqlConfig = {
            host: process.env.MYSQL_HOST,
            user: process.env.MYSQL_USER,
            password: process.env.MYSQL_PASSWORD,
            database: process.env.MYSQL_DB
        };

        if (!mysqlConfig.host || !mysqlConfig.user || !mysqlConfig.password || !mysqlConfig.database) {
            throw new Error("MySQL 접속 정보가 환경 변수에 설정되지 않았습니다.");
        }

        mysqldb = mysql.createConnection(mysqlConfig);

        mysqldb.connect((err) => {
            if (err) {
                console.error("MySQL 접속 실패:", err);
                throw err;
            } else {
                console.log("MySQL 접속 성공");
            }
        });

        return { mongodb, mysqldb };
    } catch (err) {
        console.error("DB 접속 실패", err);
        throw err;
    }
};

module.exports = setup;
