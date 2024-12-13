// src/lib/db.js

import mysql from 'mysql2/promise';
import { DB_USERNAME, DB_PASSWORD } from "$env/static/private";

const db = await mysql.createConnection({
  host: 'localhost',
  user: DB_USERNAME,
  password: DB_PASSWORD, 
  database: 'hanapsalita'
});

db.connect(function(err) {
  if (err) {
    console.error('error connecting: ' + err.stack);
    return;
  }

  console.log('connected as id ' + db.threadId);
});

export default db;

