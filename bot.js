const { TelegramBot } = require('node-telegram-bot-api');
const mysql = require('mysql2');

// --- Настройки бота ---
const token = '8948464887:AAExEPdQqzaarh9eJZ3zKS2S7JZx4J0yHEw'; 
const bot = new TelegramBot(token, { polling: true });

// --- Подключение к MySQL ---
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
    console.log('✅ Подключено к MySQL');
});

// --- Команда /start ---
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, 'Привет, октагон!');
});

// --- Команда /help ---
bot.onText(/\/help/, (msg) => {
    const chatId = msg.chat.id;
    const helpText = 
` Доступные команды:
/help - показать список команд
/site - ссылка на сайт Октагона
/creator - информация о создателе
/randomItem - получить случайный предмет из БД
/getItemByID <id> - получить предмет по ID
/deleteItem <id> - удалить предмет по ID`;
    bot.sendMessage(chatId, helpText);
});

// --- Команда /site ---
bot.onText(/\/site/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, ' Сайт Октагона: https://octagon.ru');
});

// --- Команда /creator ---
bot.onText(/\/creator/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, '👤 Автор бота: Шидэ Арина'); 
});

// --- Команда /randomItem ---
bot.onText(/\/randomItem/, (msg) => {
    const chatId = msg.chat.id;
    connection.query('SELECT * FROM Items ORDER BY RAND() LIMIT 1', (err, results) => {
        if (err) {
            console.error(err);
            bot.sendMessage(chatId, '❌ Ошибка базы данных');
            return;
        }
        if (results.length === 0) {
            bot.sendMessage(chatId, ' В базе данных нет предметов');
            return;
        }
        const item = results[0];
        bot.sendMessage(chatId, `${item.id} - ${item.name}: ${item.desc}`);
    });
});

// --- Команда /getItemByID <id> --- // Команды с параметрами вводятся через пробел: /getItemByID 1, /deleteItem 2
bot.onText(/\/getItemByID (.+)/, (msg, match) => {
    const chatId = msg.chat.id;
    const id = parseInt(match[1]);
    if (isNaN(id)) {
        bot.sendMessage(chatId, '❌ Некорректный ID. Введите число.');
        return;
    }
    connection.query('SELECT * FROM Items WHERE id = ?', [id], (err, results) => {
        if (err) {
            console.error(err);
            bot.sendMessage(chatId, '❌ Ошибка базы данных');
            return;
        }
        if (results.length === 0) {
            bot.sendMessage(chatId, `❌ Предмет с ID ${id} не найден`);
            return;
        }
        const item = results[0];
        bot.sendMessage(chatId, `${item.id} - ${item.name}: ${item.desc}`);
    });
});

// --- Команда /deleteItem <id> ---
bot.onText(/\/deleteItem (.+)/, (msg, match) => {
    const chatId = msg.chat.id;
    const id = parseInt(match[1]);
    if (isNaN(id)) {
        bot.sendMessage(chatId, '❌ Некорректный ID. Введите число.');
        return;
    }
    // Сначала проверяем, существует ли запись
    connection.query('SELECT * FROM Items WHERE id = ?', [id], (err, rows) => {
        if (err) {
            console.error(err);
            bot.sendMessage(chatId, '❌ Ошибка базы данных');
            return;
        }
        if (rows.length === 0) {
            bot.sendMessage(chatId, `❌ Предмет с ID ${id} не найден. Удаление невозможно.`);
            return;
        }
        // Удаляем
        connection.query('DELETE FROM Items WHERE id = ?', [id], (err2) => {
            if (err2) {
                console.error(err2);
                bot.sendMessage(chatId, '❌ Ошибка базы данных');
                return;
            }
            bot.sendMessage(chatId, `✅ Предмет с ID ${id} успешно удалён`);
        });
    });
});

console.log(' Бот запущен!');