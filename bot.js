const { TelegramBot } = require('node-telegram-bot-api');

const token = '8948464887:AAExEPdQqzaarh9eJZ3zKS2S7JZx4J0yHEw'; // замените на ваш реальный токен
const bot = new TelegramBot(token, { polling: true });

// Команда /start
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, 'Привет, октагон!');
});

// Команда /help — список команд
bot.onText(/\/help/, (msg) => {
    const chatId = msg.chat.id;
    const helpText = 
`Доступные команды:
/help - показать список команд
/site - ссылка на сайт Октагона
/creator - информация о создателе`;
    bot.sendMessage(chatId, helpText);
});

// Команда /site — ссылка на сайт Октагона
bot.onText(/\/site/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, ' Сайт Октагона: https://octagon.ru');
});

// Команда /creator — ФИО автора
bot.onText(/\/creator/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, ' Автор бота: Шидэ Арина'); // замените на своё ФИО
});

console.log(' Бот запущен!');