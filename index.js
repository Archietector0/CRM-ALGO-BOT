/* eslint-disable import/no-extraneous-dependencies */
import dotenv from 'dotenv';
dotenv.config()
import TelegramBot from 'node-telegram-bot-api';
import Koa from 'koa';
import Router from 'koa-router';
import bodyParser from 'koa-bodyparser';
import { Session } from './src/telegram/Session.js';
import { telegram } from './src/telegram/Telegram.js';
import {
  BACK_MAIN_MENU_KEYBOARD,
  CHOOSE_PRIORITY_KEYBOARD,
  CREATE_TASK_KEYBOARD,
  DELETE_CURRENT_TASK_KEYBOARD,
  EMPTY_FIELD_KEYBOARD,
  GREETING_KEYBOARD,
} from './src/telegram/constants.js';
import { Task } from './src/telegram/Task.js';
import { googleSheet } from './src/google/googleSheet.js';
import { LIST_TABLE_NAMES } from './src/google/constants.js';
import { writeLogToDB } from './src/logger/logger.js';
import { QueryTypes, STRING } from "sequelize";
import { db } from './src/db/index.js';

function addCurrentSession({ sessions, sessionInfo }) {
  let flag = 0;
  let sessionNumber;
  let firstName;
  let userName;
  // let mainMsgId;

  
  for (let key in sessionInfo) if (key === 'message') flag = 1;
  sessionNumber = !flag ? sessionInfo?.chat?.id : sessionInfo?.message?.chat.id;
  firstName = !flag
    ? sessionInfo.chat.first_name
    : sessionInfo.message.chat.first_name;
  userName = !flag
    ? sessionInfo.chat.username
    : sessionInfo.message.chat.username;
  // mainMsgId = !flag ? sessionInfo.message_id : sessionInfo.message.message_id;

  if (!sessions.has(sessionNumber)) {
    sessions.set(
      sessionNumber,
      new Session({
        sessionNumber,
        firstName,
        userName,
        // mainMsgId: mainMsgId + 1
      })
    );
  }
}

function getCurrentSession({ sessions, sessionInfo }) {
  let flag = 0;
  let chatId;

  for (let key in sessionInfo) if (key === 'message') flag = 1;
  chatId = !flag ? sessionInfo.chat.id : sessionInfo.message.chat.id;

  return sessions.get(chatId);
}

async function getTelegramId({ cbQuery, session, bot }) {
  session.setMainMsgId(cbQuery.message.message_id);
  const phrase = `Твой телеграм id: ${session.getSessionNumber()}`;
  await telegram.editMessage({
    msg: cbQuery,
    phrase,
    session,
    keyboard: BACK_MAIN_MENU_KEYBOARD,
    bot,
  });
  session.setState('deleter');
}

async function createTask({ cbQuery, session, bot }) {
  session.setMainMsgId(cbQuery.message.message_id);
  const phrase = `Выбери к какому отделу привязать задачу:`;
  let keyboard = {
    inline_keyboard: [],
  };
  let dataFromTable = await googleSheet.getDataFromSheet(
    LIST_TABLE_NAMES.TABLE_PROJECTS
  );

  for (let i = 0; i < dataFromTable.length; i++) {
    if (String(session.getSessionNumber()) === String(dataFromTable[i].tlgm_id)) {
      keyboard.inline_keyboard.push([
        {
          text: `${dataFromTable[i].project_name}`,
          callback_data: `choose_project*${dataFromTable[i].project_name}`,
        },
      ]);
    }
  }

  keyboard.inline_keyboard.push([
    {
      text: 'Назад',
      callback_data: 'back_to_main_menu',
    },
  ]);

  await telegram.editMessage({
    msg: cbQuery,
    phrase,
    session,
    keyboard,
    bot,
  });

  session.setState('deleter');
}

async function inputHeader({ cbQuery, session, bot }) {
  session.setMainMsgId(cbQuery.message.message_id);
  const phrase = 'Введите заголовок задачи:';
  await telegram.editMessage({ msg: cbQuery, phrase, session, bot });
}

async function inputDescription({ cbQuery, session, bot }) {
  session.setMainMsgId(cbQuery.message.message_id);
  const phrase = 'Введите описание задачи:';
  await telegram.editMessage({ msg: cbQuery, phrase, session, bot });
}

async function choosePriority({ cbQuery, session, bot }) {
  session.setMainMsgId(cbQuery.message.message_id);
  const phrase = 'Укажите приоритет задачи:';
  await telegram.editMessage({
    msg: cbQuery,
    phrase,
    session,
    keyboard: CHOOSE_PRIORITY_KEYBOARD,
    bot,
  });
  session.setState('deleter');
}

async function fillTaskFields({ cbQuery, session, bot }) {
  const phrase = `Заполни поля для задачи.\n\nПроект:\n\t\t\t${session
    .getLastTask()
    .getProject()}\nЗаголовок:\n\t\t\t${session
    .getLastTask()
    .getHeader()}\nОписание:\n\t\t\t${session
    .getLastTask()
    .getDescription()}\nПриоритет:\n\t\t\t${session
    .getLastTask()
    .getPriority()}\nИсполнитель:\n\t\t\t${session
    .getLastTask()
    .getAssignPerformer()}\nКто назначил:\n\t\t\t${session
    .getLastTask()
    .getAssignFrom()}`;
  await telegram.editMessage({
    msg: cbQuery,
    phrase,
    session,
    keyboard: CREATE_TASK_KEYBOARD,
    bot,
  });
  session.setState('deleter');
}

async function choosePerformer({ cbQuery, session, bot }) {
  session.setMainMsgId(cbQuery.message.message_id);
  const phrase = `Укажите исполнителя:`;
  const dataFromTable = await googleSheet.getDataFromSheet(
    LIST_TABLE_NAMES.TABLE_USERS
  );

  let keyboard = {
    inline_keyboard: [],
  };

  for (let i = 0; i < dataFromTable.length; i++) {
    if (
      String(session.getSessionNumber()) === String(dataFromTable[i].tlgm_id) &&
      String(dataFromTable[i].status) === '1'
    ) {
      keyboard.inline_keyboard.push([
        {
          text: `${dataFromTable[i].assignee_name}`,
          callback_data: `assign_performer*${dataFromTable[i].assignee_id}*${dataFromTable[i].assignee_name}`,
        },
      ]);
    }
  }

  await telegram.editMessage({
    msg: cbQuery,
    phrase,
    session,
    keyboard,
    bot,
  });
  session.setState('deleter');
}

async function backToMainMenu({ cbQuery, session, bot }) {
  session.setMainMsgId(cbQuery.message.message_id);
  const phrase = `Привет ${session.getFirstName()}, 😕\n\nТут ты можешь творить дела со своими задачами.\nВыбери интересующую тебя функцию:`;
  await telegram.editMessage({
    msg: cbQuery,
    phrase,
    session,
    keyboard: GREETING_KEYBOARD,
    bot,
  });
  session.setState('deleter');
}

async function finishTask({ cbQuery, session, bot }) {
  session.setMainMsgId(cbQuery.message.message_id);
  if (
    session.getLastTask().getProject() === '' ||
    session.getLastTask().getHeader() === '' ||
    session.getLastTask().getDescription() === '' ||
    session.getLastTask().getPriority() === '' ||
    session.getLastTask().getAssignPerformer() === '' ||
    session.getLastTask().getAssignFrom() === ''
  ) {
    const phrase = 'Одно из полей не заполнено, проверь';
    await telegram.editMessage({
      msg: cbQuery,
      phrase,
      session,
      keyboard: EMPTY_FIELD_KEYBOARD,
      bot,
    });
    session.setState('deleter');
    return;
  }

  // console.log();

  try {
    await writeLogToDB({ msg: cbQuery, userSession: session })
  } catch (e) {
    console.log(`ERROR: ${e.message}`);
  }

  const phrase = `Привет ${session.getFirstName()}, 😕\n\nТут ты можешь творить дела со своими задачами.\nВыбери интересующую тебя функцию:`;
  await telegram.editMessage({
    msg: cbQuery,
    phrase,
    session,
    keyboard: GREETING_KEYBOARD,
    bot,
  });
  session.setState('deleter');
}

async function showTasks({ cbQuery, session, bot }) {
  session.setMainMsgId(cbQuery.message.message_id);
  await telegram.deleteMsg({ msg: cbQuery, bot });


  try {
    let currentTasks = await db.sequelize.query(`
    SELECT
      *
    FROM
      "${process.env.DB_TABLE_NAME}"
    WHERE
      status <> 'DELETED'
      and assignee_to = '${cbQuery.message.chat.id}'
    `,  { type: QueryTypes.SELECT })

    console.log("CURRENT_TASKS: ", currentTasks);

    for (let i = 0; i < currentTasks.length; i++) {
      const phrase = `${(currentTasks[i].created_at).toISOString()}\n--------------------------------\nПроект:\n\t\t\t${currentTasks[i].project_name}\nЗаголовок:\n\t\t\t${currentTasks[i].header}\nОписание:\n\t\t\t${currentTasks[i].description}\nПриоритет:\n\t\t\t${currentTasks[i].priority}\nИсполнитель:\n\t\t\t${currentTasks[i].assignee_to}\nКто назначил:\n\t\t\t${currentTasks[i].assignee}\n--------------------------------\nСтатус задачи: ${currentTasks[i].status}`;
      const keyboard = {
        inline_keyboard: [
          [{
            text: 'Сменить статус',
            callback_data: `task_action_change_status*${currentTasks[i].uuid}`
          }, {
            text: 'Удалить',
            callback_data: `task_action_delete*delete*${currentTasks[i].uuid}`
          }], [{
            text: 'Скрыть',
            callback_data: 'hide_task'
          }]
        ]
      }
      await telegram.sendMessage({ msg: cbQuery, phrase, keyboard, bot })
      session.idToDelete.push(++cbQuery.message.message_id);
    }

    console.log('currentTasks: ', currentTasks);
  } catch (e) {
    console.log(`ERROR BAB: ${e.message}`);
  }

  const phrase = `Выше представлены все ваши задачи`;
  await telegram.sendMessage({
    msg: cbQuery,
    phrase,
    keyboard: DELETE_CURRENT_TASK_KEYBOARD,
    bot,
  });
  session.setState('deleter');
}

async function deleteVisibleTasks({ cbQuery, session, bot }) {

  session.setMainMsgId(cbQuery.message.message_id);
  for (let i = 0; i < session.idToDelete.length; i++) {
    try {
      await bot.deleteMessage(
        session.getSessionNumber(),
        --cbQuery.message.message_id
      );
    } catch (e) {
      console.log(e.message);
    }
  }
  session.idToDelete = [];
  const phrase = `Привет ${session.getFirstName()}, 😕\n\nТут ты можешь творить дела со своими задачами.\nВыбери интересующую тебя функцию:`;
  await telegram.editMessage({
    msg: cbQuery,
    phrase,
    session,
    keyboard: GREETING_KEYBOARD,
    bot,
  });
  session.setState('deleter');
}

async function processingMessageOperationLogic({ msg, session, bot }) {
  switch (session.getState()) {
    case 'deleter': {
      session.setMainMsgId(msg.message_id);
      await telegram.deleteMsg({ msg, bot });
      break;
    }

    case 'input_header': {
      session.getLastTask().setHeader(msg.text);
      await telegram.deleteMsg({ msg, bot });
      const phrase = `Заполни поля для задачи.\n\nПроект:\n\t\t\t${session
        .getLastTask()
        .getProject()}\nЗаголовок:\n\t\t\t${session
        .getLastTask()
        .getHeader()}\nОписание:\n\t\t\t${session
        .getLastTask()
        .getDescription()}\nПриоритет:\n\t\t\t${session
        .getLastTask()
        .getPriority()}\nИсполнитель:\n\t\t\t${session
        .getLastTask()
        .getAssignPerformer()}\nКто назначил:\n\t\t\t${session
        .getLastTask()
        .getAssignFrom()}`;
      telegram.editMessage({
        msg,
        phrase,
        session,
        keyboard: CREATE_TASK_KEYBOARD,
        bot,
      });
      session.setState('deleter');
      break;
    }

    case 'input_description': {
      session.getLastTask().setDescription(msg.text);
      await telegram.deleteMsg({ msg, bot });
      const phrase = `Заполни поля для задачи.\n\nПроект:\n\t\t\t${session
        .getLastTask()
        .getProject()}\nЗаголовок:\n\t\t\t${session
        .getLastTask()
        .getHeader()}\nОписание:\n\t\t\t${session
        .getLastTask()
        .getDescription()}\nПриоритет:\n\t\t\t${session
        .getLastTask()
        .getPriority()}\nИсполнитель:\n\t\t\t${session
        .getLastTask()
        .getAssignPerformer()}\nКто назначил:\n\t\t\t${session
        .getLastTask()
        .getAssignFrom()}`;
      telegram.editMessage({
        msg,
        phrase,
        session,
        keyboard: CREATE_TASK_KEYBOARD,
        bot,
      });
      session.setState('deleter');
      break;
    }

    default: {
      console.log(msg);
      session.setMainMsgId(msg.message_id);
      const phrase = `Привет ${session.getFirstName()}, 😕\n\nТут ты можешь творить дела со своими задачами.\nВыбери интересующую тебя функцию:`;
      await telegram.sendMessage({
        msg,
        phrase,
        keyboard: GREETING_KEYBOARD,
        bot,
      });
      session.setState('deleter');
      break;
    }
  }
}

async function processingCallbackQueryOperationLogic({ cbQuery, session, bot }) {
  switch (session.getState()) {
    case 'get_telegram_id': {
      await getTelegramId({ cbQuery, session, bot });
      break;
    }

    case 'create_task': {
      await createTask({ cbQuery, session, bot });
      break;
    }

    case 'input_header': {
      await inputHeader({ cbQuery, session, bot });
      break;
    }

    case 'input_description': {
      await inputDescription({ cbQuery, session, bot });
      break;
    }

    case 'choose_priority': {
      await choosePriority({ cbQuery, session, bot });
      break;
    }

    case 'urgent': {
      session.setMainMsgId(cbQuery.message.message_id);
      session.getLastTask().setPriority('Срочное');

      await fillTaskFields({ cbQuery, session, bot });
      break;
    }

    case 'important': {
      session.setMainMsgId(cbQuery.message.message_id);
      session.getLastTask().setPriority('Важное');

      await fillTaskFields({ cbQuery, session, bot });
      break;
    }

    case 'urgent_important': {
      session.setMainMsgId(cbQuery.message.message_id);
      session.getLastTask().setPriority('Срочное важное');

      await fillTaskFields({ cbQuery, session, bot });
      break;
    }

    case 'without_priority': {
      session.setMainMsgId(cbQuery.message.message_id);
      session.getLastTask().setPriority('Без приоритета');

      await fillTaskFields({ cbQuery, session, bot });
      break;
    }
    case 'choose_performer': {
      await choosePerformer({ cbQuery, session, bot });
      break;
    }

    case 'back_to_main_menu': {
      await backToMainMenu({ cbQuery, session, bot });
      break;
    }

    case 'cancel_task': {
      session.removeLastTask();
      await backToMainMenu({ cbQuery, session, bot });
      break;
    }

    case 'show_tasks': {
      await showTasks({ cbQuery, session, bot });
      break;
    }

    case 'delete_tasks_back_to_main_menu': {
      await deleteVisibleTasks({ cbQuery, session, bot });
      break;
    }

    case 'finish_task': {
      await finishTask({ cbQuery, session, bot });
      break;
    }

    case 'correct_empty_field': {
      session.setMainMsgId(cbQuery.message.message_id);
      await fillTaskFields({ cbQuery, session, bot });
      break;
    }

    case 'hide_task': {
      session.setMainMsgId(cbQuery.message.message_id);
      await telegram.deleteMsg({ msg: cbQuery, bot })
      break
    }

    default: {
      let data = cbQuery.data.split('*');
      switch (data[0]) {
        case 'assign_performer': {
          session.setMainMsgId(cbQuery.message.message_id);
          session.getLastTask().setAssignPerformer(data[1]);
          await fillTaskFields({ cbQuery, session, bot });
          break;
        }
        case 'choose_project': {
          session.addTask(new Task(session.getSessionNumber()));
          session.getLastTask().setProject(data[1]);

          session.setMainMsgId(cbQuery.message.message_id);
          await fillTaskFields({ cbQuery, session, bot });
          break;
        } case 'task_action_change_status': {

          session.setMainMsgId(cbQuery.message.message_id);
          const phrase = 'Выберите статус задачи:'

          const CHOOSE_TASK_STATUS_KEYBOARD = {
            inline_keyboard: [
              [{
                text: 'В процессе',
                callback_data: `choose_task_status*IN_PROGRESS*${data[1]}`
              }, {
                text: 'Закрыта',
                callback_data: `choose_task_status*CLOSED*${data[1]}`
              }], [{
                text: 'Открыта',
                callback_data: `choose_task_status*OPENED*${data[1]}`
              }, {
                text: 'Отменена',
                callback_data: `choose_task_status*CANCELED*${data[1]}`
              }], [{
                text: 'Назад',
                callback_data: `go_main_task_menu*${data[1]}`
              }]
            ]
          }
          await telegram.editMessage({ msg: cbQuery, phrase, session, keyboard: CHOOSE_TASK_STATUS_KEYBOARD, bot })
          break
        }
        case 'choose_task_status': {
          session.setMainMsgId(cbQuery.message.message_id);

          try {
            await db.sequelize.query(`
            UPDATE
              "${process.env.DB_TABLE_NAME}"
            SET
              status = '${data[1]}'
            WHERE
              uuid IN (
                SELECT
                  uuid
                FROM
                  "${process.env.DB_TABLE_NAME}"
                WHERE
                  uuid = '${data[2]}'
              )
            `, { type: QueryTypes.UPDATE })
          } catch (e) {
            console.log(e.message);
          }

          try {
            let currentTasks = await db.sequelize.query(`
            SELECT
              *
            FROM
              "${process.env.DB_TABLE_NAME}"
            WHERE
              uuid = '${data[2]}'
            `, { type: QueryTypes.SELECT })
  
            const phrase = `${(currentTasks[0].created_at).toISOString()}\n--------------------------------\nПроект:\n\t\t\t${currentTasks[0].project_name}\nЗаголовок:\n\t\t\t${currentTasks[0].header}\nОписание:\n\t\t\t${currentTasks[0].description}\nПриоритет:\n\t\t\t${currentTasks[0].priority}\nИсполнитель:\n\t\t\t${currentTasks[0].assignee_to}\nКто назначил:\n\t\t\t${currentTasks[0].assignee}\n--------------------------------\nСтатус задачи: ${currentTasks[0].status}`;
            const keyboard = {
              inline_keyboard: [
                [{
                  text: 'Сменить статус',
                  callback_data: `task_action_change_status*${currentTasks[0].uuid}`
                }, {
                  text: 'Удалить',
                  callback_data: `task_action_delete*delete*${currentTasks[0].uuid}`
                }], [{
                  text: 'Скрыть',
                  callback_data: 'hide_task'
                }]
              ]
            }
            await telegram.editMessage({ msg: cbQuery, phrase, session, keyboard, bot })
          } catch (e) {
            console.log(e.message);
          }
          
          break
        }
        case 'go_main_task_menu': {
          session.setMainMsgId(cbQuery.message.message_id);

          try {
            let currentTasks = await db.sequelize.query(`
            SELECT
              *
            FROM
              "${process.env.DB_TABLE_NAME}"
            WHERE
              uuid = '${data[1]}'
            `, { type: QueryTypes.SELECT })
            const phrase = `${(currentTasks[0].created_at).toISOString()}\n--------------------------------\nПроект:\n\t\t\t${currentTasks[0].project_name}\nЗаголовок:\n\t\t\t${currentTasks[0].header}\nОписание:\n\t\t\t${currentTasks[0].description}\nПриоритет:\n\t\t\t${currentTasks[0].priority}\nИсполнитель:\n\t\t\t${currentTasks[0].assignee_to}\nКто назначил:\n\t\t\t${currentTasks[0].assignee}\n--------------------------------\nСтатус задачи: ${currentTasks[0].status}`;
            const keyboard = {
              inline_keyboard: [
                [{
                  text: 'Сменить статус',
                  callback_data: `task_action_change_status*${currentTasks[0].uuid}`
                }, {
                  text: 'Удалить',
                  callback_data: `task_action_delete*delete*${currentTasks[0].uuid}`
                }], [{
                  text: 'Скрыть',
                  callback_data: 'hide_task'
                }]
              ]
            }
            await telegram.editMessage({ msg: cbQuery, phrase, session, keyboard, bot })
          } catch (e) {
            console.log(e.message);
          }
          break
        }
        case 'task_action_delete': {
          session.setMainMsgId(cbQuery.message.message_id);
          await telegram.deleteMsg({ msg: cbQuery, bot })

          try {
            await db.sequelize.query(`
            UPDATE
              "${process.env.DB_TABLE_NAME}"
            SET
              status = 'DELETED'
            WHERE
              uuid IN (
                SELECT
                  uuid
                FROM
                  "${process.env.DB_TABLE_NAME}"
                WHERE
                  uuid = '${data[2]}'
              )
            `, { type: QueryTypes.UPDATE })
          } catch (e) {
            console.log(e.message);
          }

          break;
        }
      }
      break;
    }
  }
}

//------------------------------------------

const bot = new TelegramBot(process.env.TOKEN);
bot.setWebHook(`${process.env.URL}/bot${process.env.TOKEN}`);

const app = new Koa();

const router = new Router();
router.post(`/bot${process.env.TOKEN}`, async (ctx) => {
  const { body } = ctx.request;
  console.log(body);
  if (body.task === 'getAllDataFromDB') {
    try {
      let data = await db.sequelize.query(`
      SELECT
        *
      FROM
        "${process.env.DB_TABLE_NAME}"
      `, { type: QueryTypes.SELECT })
  
      const values = [
        ['uuid', 'header', 'project_name', 'assignee', 'assignee_to', 'priority', 'description', 'created_at', 'status'],
        ...data.map(item => [
          item.uuid,
          item.header,
          item.project_name,
          item.assignee,
          item.assignee_to,
          item.priority,
          item.description,
          item.created_at,
          item.status
        ])
      ]
  
      await googleSheet.clearSheet({ spreadsheetId: process.env.SPREED_SHEET_ID, range: 'table_task!A1:I1000' })
      await googleSheet.batchUpdateValues({ spreadsheetId: process.env.SPREED_SHEET_ID, range: 'table_task!A1:I1000', valueInputOption: 'RAW', values })
    } catch (e) {
      console.log(e.message);
    }
  }
  bot.processUpdate(body);
  ctx.status = 200;
});

app.use(bodyParser());
app.use(router.routes());

app.listen(process.env.PORT, () => {
  console.log(`Listening port ${process.env.PORT}`);
});

//------------------------------------------

const sessions = new Map();

//------------------------------------------

bot.onText(/\/restart/, async (msg) => {
  addCurrentSession({ sessions, sessionInfo: msg }) 
  let session = getCurrentSession({ sessions, sessionInfo: msg })

  try {
    await bot.deleteMessage(msg.chat.id, msg.message_id - 1)
  } catch (e) {
    console.log(e.message);
  }
  await telegram.deleteMsg({ msg, bot })


  const phrase = `Привет ${session.getFirstName()}, 😕\n\nТут ты можешь творить дела со своими задачами.\nВыбери интересующую тебя функцию:`;
  await telegram.sendMessage({ msg, phrase, keyboard: GREETING_KEYBOARD, bot })
})


bot.on('message', async (msg) => {
  if (msg.text === '/restart') return
  addCurrentSession({ sessions, sessionInfo: msg });
  const session = getCurrentSession({ sessions, sessionInfo: msg });
  session.action = 'message'

  await processingMessageOperationLogic({ msg, session, bot });
});

bot.on('callback_query', async (cbQuery) => {
  addCurrentSession({ sessions, sessionInfo: cbQuery });
  const session = getCurrentSession({ sessions, sessionInfo: cbQuery });
  session.action = 'callback_query'
  session.setState(cbQuery.data);

  await processingCallbackQueryOperationLogic({ cbQuery, session, bot });
});
