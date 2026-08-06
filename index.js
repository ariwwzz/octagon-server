const express = require('express');
const mysql = require('mysql2');
const app = express();
const PORT = 3000;

// Подключение к MySQL
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'appuser',
    password: '12345',
    database: 'ChatBotTests'
});

connection.connect((err) => {
    if (err) {
        console.error('❌ Ошибка подключения к MySQL:', err);
        return;
    }
    console.log(' Подключено к MySQL');
});

// Разрешаем парсить JSON и URL-encoded данные (для POST-запросов)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ----- Существующие маршруты -----
app.get('/', (req, res) => {
    res.send('<h1>Привет, Октагон!</h1>');
});

app.get('/static', (req, res) => {
    res.json({ header: 'Hello', body: 'Octagon NodeJS Test' });
});

app.get('/dynamic', (req, res) => {
    const a = parseFloat(req.query.a);
    const b = parseFloat(req.query.b);
    const c = parseFloat(req.query.c);
    if (!isNaN(a) && !isNaN(b) && !isNaN(c)) {
        const result = (a * b * c) / 3;
        res.json({ header: 'Calculated', body: String(result) });
    } else {
        res.json({ header: 'Error' });
    }
});

// ----- Новые маршруты для работы с Items -----

// 1. GET /getAllItems - возвращает все записи из таблицы Items
app.get('/getAllItems', (req, res) => {
    connection.query('SELECT * FROM Items', (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Database error' });
        }
        res.json(results);
    });
});

// 2. POST /addItem?name=TEXT&desc=TEXT2 - добавляет новую запись
app.post('/addItem', (req, res) => {
    const { name, desc } = req.query;
    if (!name || !desc) {
        return res.json(null); // неправильные параметры
    }
    connection.query(
        'INSERT INTO Items (name, `desc`) VALUES (?, ?)',
        [name, desc],
        (err, result) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'Database error' });
            }
            // Возвращаем добавленный объект с id
            res.json({ id: result.insertId, name, desc });
        }
    );
});

// 3. POST /deleteItem?id=number - удаляет запись по id
app.post('/deleteItem', (req, res) => {
    const id = parseInt(req.query.id);
    if (isNaN(id)) {
        return res.json(null); // неправильный параметр
    }
    // Сначала проверим, существует ли запись
    connection.query('SELECT * FROM Items WHERE id = ?', [id], (err, rows) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Database error' });
        }
        if (rows.length === 0) {
            return res.json({}); // объект не найден
        }
        // Удаляем
        connection.query('DELETE FROM Items WHERE id = ?', [id], (err2) => {
            if (err2) {
                console.error(err2);
                return res.status(500).json({ error: 'Database error' });
            }
            // Возвращаем пустой объект, так как объект удалён
            res.json({});
        });
    });
});

// 4. POST /updateItem?id=number&name=TEXT&desc=TEXT2 - обновляет запись
app.post('/updateItem', (req, res) => {
    const id = parseInt(req.query.id);
    const name = req.query.name;
    const desc = req.query.desc;
    if (isNaN(id) || !name || !desc) {
        return res.json(null); // неправильные параметры
    }
    // Проверяем существование
    connection.query('SELECT * FROM Items WHERE id = ?', [id], (err, rows) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Database error' });
        }
        if (rows.length === 0) {
            return res.json({}); // объект не найден
        }
        // Обновляем
        connection.query(
            'UPDATE Items SET name = ?, `desc` = ? WHERE id = ?',
            [name, desc, id],
            (err2) => {
                if (err2) {
                    console.error(err2);
                    return res.status(500).json({ error: 'Database error' });
                }
                // Возвращаем обновлённый объект
                res.json({ id, name, desc });
            }
        );
    });
});

// Запуск сервера
app.listen(PORT, () => {
    console.log(` Сервер запущен на http://localhost:${PORT}`);
});