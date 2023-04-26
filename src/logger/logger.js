import { db } from "../db/index.js";
import crypto from "crypto";

// const Image = db.image

export async function writeLogToDB ({ msg, userSession, error = '' }) {

  const log = {
    uuid: '',
    header: '',
    project_name: '',
    assignee: '',
    assignee_to: '',
    priority: '',
    description: '',
    created_at: '',
    status: ''
  }


  log.uuid = String(crypto.createHash('md5').update(Buffer.from(JSON.stringify(msg) + JSON.stringify(userSession) + (new Date())).toString('base64')).digest('hex'))

  if (userSession.action === 'callback_query' && !error) {
    log.header = userSession.getLastTask().getHeader() ? userSession.getLastTask().getHeader() : 'not specified'
    log.project_name = userSession.getLastTask().getProject() ? userSession.getLastTask().getProject() : 'not specified'
    log.assignee = userSession.getLastTask().getAssignFrom() ? userSession.getLastTask().getAssignFrom() : 'not specified'
    log.assignee_to = userSession.getLastTask().getAssignPerformer() ? userSession.getLastTask().getAssignPerformer() : 'not specified'
    log.priority = userSession.getLastTask().getPriority() ? userSession.getLastTask().getPriority() : 'not specified'
    log.description = userSession.getLastTask().getDescription() ? userSession.getLastTask().getDescription() : 'not specified'
    log.created_at = new Date()
    log.status = 'ACTIVE'

    return await db.image.create(log)
  } else if (userSession.action === 'message' && !error) {
    log.header = userSession.getLastTask().getHeader() ? userSession.getLastTask().getHeader() : 'not specified'
    log.project_name = userSession.getLastTask().getProject() ? userSession.getLastTask().getProject() : 'not specified'
    log.assignee = userSession.getLastTask().getAssignFrom() ? userSession.getLastTask().getAssignFrom() : 'not specified'
    log.assignee_to = userSession.getLastTask().getAssignPerformer() ? userSession.getLastTask().getAssignPerformer() : 'not specified'
    log.priority = userSession.getLastTask().getPriority() ? userSession.getLastTask().getPriority() : 'not specified'
    log.description = userSession.getLastTask().getDescription() ? userSession.getLastTask().getDescription() : 'not specified'
    log.created_at = new Date()
    log.status = 'ACTIVE'

    return await db.image.create(log)
  } 

  // LOGIN WITH ERRORS

  // else {
  //   let msg_bf = userSession.action === 'message' ? msg : msg.message

  //   log.user_name = msg_bf?.chat?.username ? `@${msg_bf?.chat?.username}` : 'not specified'
  //   log.telegram_id = `${msg_bf?.chat?.id}`
  //   log.date = (new Date((!msg_bf?.date ? 1 : msg_bf?.date) * 1000)).toISOString()
  //   log.action = userSession.action
  //   log.first_name = !msg_bf?.chat?.first_name ? 'Не указано имя' : msg_bf?.chat?.first_name
  //   log.state = `${userSession.state} ERROR`
  //   log.msg_text = error.message
  //   log.json_data = !JSON.stringify(msg_bf) ? String({ error: 'empty JSON' }) : JSON.stringify(msg_bf)
  //   log.user_session = !JSON.stringify(userSession) ? String({ error: 'empty JSON' }) : JSON.stringify(userSession)

  //   return await Image.create(log)
  // }
}