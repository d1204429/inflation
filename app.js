var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

//使用 sqlite3 來操作數據庫，並開啟位置在 db/sqlite.db 的資料庫，需要確認是否成功打開資料庫
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('db/sqlite.db', (err) => {
  if (err) {
    console.error(err.message);
  }
  console.log('Connected to the sqlite database.');
});

//寫 /api/future 路由，並使用 db.all 方法來取得資料庫中的所有期貨資料，並回傳給前端
app.get('/api/future', (req, res) => {
  const name = req.query.name;
  db.all('SELECT * FROM futures WHERE name = ? order by date', [name],(err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

//用/api/insert 路由，使用post的方式新增一筆資料 (date,name,closing_price)
app.post('/api/insert', (req, res) => {
  const { date, name, closing_price } = req.body;
    db.run('INSERT INTO futures (date, name, closing_price) VALUES (?, ?, ?)', [date, name, closing_price], function (err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ id: this.lastID });
  });
});

module.exports = app;
