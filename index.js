const express = require('express');
const app = express();
const PORT = 3000;

// Статический маршрут
app.get('/static', (req, res) => {
  res.json({ header: 'Hello', body: 'Octagon NodeJS Test' });
});

// Динамический маршрут с параметрами a, b, c
app.get('/dynamic', (req, res) => {
  const a = parseFloat(req.query.a);
  const b = parseFloat(req.query.b);
  const c = parseFloat(req.query.c);

  // Проверяем, что все параметры переданы и являются числами
  if (!isNaN(a) && !isNaN(b) && !isNaN(c)) {
    const result = (a * b * c) / 3;
    res.json({ header: 'Calculated', body: String(result) });
  } else {
    res.json({ header: 'Error' });
  }
});

// Обработка корневого пути (для проверки)
app.get('/', (req, res) => {
  res.send('<h1>Привет, Октагон!</h1>');
});

app.listen(PORT, () => {
  console.log(`Сервер запущен на http://localhost:${PORT}`);
});