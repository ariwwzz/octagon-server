const TelegramBot = require('node-telegram-bot-api').default;
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
/deleteItem <id> - удалить предмет по ID
!qr <текст/ссылка> - создать QR-код
!webscr <url> - скриншот сайта`;
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
            bot.sendMessage(chatId, '📭 В базе данных нет предметов');
            return;
        }
        const item = results[0];
        bot.sendMessage(chatId, `${item.id} - ${item.name}: ${item.desc}`);
    });
});

// --- Команда /getItemByID <id> ---
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

// --- Команда !qr <текст/ссылка> ---
bot.onText(/!qr (.+)/, async (msg, match) => {
    const chatId = msg.chat.id;
    const text = match[1];
    if (!text) {
        bot.sendMessage(chatId, '❌ Укажите текст или ссылку для QR-кода.\nПример: !qr https://octagon.ru');
        return;
    }
    try {
        const encoded = encodeURIComponent(text);
        const url = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encoded}`;
        await bot.sendPhoto(chatId, url, { caption: `QR-код для: ${text}` });
    } catch (error) {
        console.error(error);
        bot.sendMessage(chatId, '❌ Ошибка при генерации QR-кода');
    }
});

// --- Команда !webscr <url> ---
bot.onText(/!webscr (.+)/, async (msg, match) => {
    const chatId = msg.chat.id;
    const url = match[1].trim();
    if (!url) {
        bot.sendMessage(chatId, '❌ Укажите адрес сайта.\nПример: !webscr https://octagon.ru');
        return;
    }
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
        bot.sendMessage(chatId, '❌ URL должен начинаться с http:// или https://');
        return;
    }

    const waitMsg = await bot.sendMessage(chatId, '⏳ Создаю скриншот сайта, подождите...');

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000);

    try {
        // Используем стабильный сервис скриншотов Microlink
        const screenshotApiUrl = `https://api.microlink.io/?url=${encodeURIComponent(url)}&screenshot=true&meta=false&embed=screenshot.url`;
        
        const response = await fetch(screenshotApiUrl, { signal: controller.signal });
        clearTimeout(timeoutId);

        if (!response.ok) {
            throw new Error('Сервис скриншотов не ответил');
        }

        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        await bot.sendPhoto(chatId, buffer, { caption: `Скриншот сайта: ${url}` });
        await bot.deleteMessage(chatId, waitMsg.message_id).catch(() => {});
    } catch (error) {
        clearTimeout(timeoutId);
        console.error(error);
        
        await bot.deleteMessage(chatId, waitMsg.message_id).catch(() => {});
        
        if (error.name === 'AbortError') {
            bot.sendMessage(chatId, '⏱️ Превышено время ожидания. Сервис скриншотов не отвечает.');
        } else {
            bot.sendMessage(chatId, '❌ Не удалось создать скриншот. Возможно, сайт заблокирован или недоступен.');
        }
    }
});

console.log(' Бот запущен!');