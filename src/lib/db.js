import mysql from 'mysql2';
import { DB_USERNAME, DB_PASSWORD } from "$env/static/private";

const pool = await mysql.createPool({
  host: 'localhost',
  user: DB_USERNAME,
  password: DB_PASSWORD, 
  database: 'hanapsalita'
}).promise();

export default pool;


