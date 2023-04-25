class Telegram {
  // Constructor
  constructor() {}

  // Public methods

  async deleteMsg({ msg, bot }) {
    let chatId;
    let messageId;
    let flag = 0;

    for (let key in msg) if (key === 'message') flag = 1;

    chatId = !flag ? msg.chat.id : msg.message.chat.id;
    messageId = !flag ? msg.message_id : msg.message.message_id;

    try {
      await bot.deleteMessage(chatId, messageId);
    } catch (e) {
      console.log(e.message);
    }
  }

  async editMessage({ msg, phrase, session, keyboard = {}, bot }) {
    let chatId;
    let messageId;
    let flag = 0;

    for (let key in msg) if (key === 'message') flag = 1;

    chatId = !flag ? msg.chat.id : msg.message.chat.id;
    messageId = session.getMainMsgId();

    try {
      await bot.editMessageText(phrase, {
        parse_mode: 'HTML',
        chat_id: chatId,
        message_id: messageId,
        reply_markup: keyboard,
      });
    } catch (e) {
      console.log('ERROR: many tries to edit msg');
      console.log(e.message);
    }
  }

  async sendMessage({ msg, phrase, keyboard = {}, bot }) {
    let chatId;
    let flag = 0;

    for (let key in msg) if (key === 'message') flag = 1;

    chatId = !flag ? msg.chat.id : msg.message.chat.id;

    try {
      await bot.sendMessage(chatId, phrase, {
        parse_mode: 'HTML',
        reply_markup: keyboard,
      });
    } catch (e) {
      console.log('ERROR: many tries to send msg');
      console.log(e.message);
    }
  }
}

export const telegram = new Telegram();
