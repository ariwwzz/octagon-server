const { TelegramBot } = require('node-telegram-bot-api');

const token = '8948464887:AAExEPdQqzaarh9eJZ3zKS2S7JZx4J0yHEw';
const bot = new TelegramBot(token, { polling: true });

bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, 'Привет, октагон!');
});

console.log('Бот запущен!');