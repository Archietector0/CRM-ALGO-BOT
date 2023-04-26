import { google } from 'googleapis';
const sheets = google.sheets('v4');

// function convertRowsToJSONWhiteList (rows) {
//     let rowsJSON = []
//     for (let i = 1; i < rows.length; i++) {
//         rowsJSON.push({
//           id: rows[i][0],
//           name: rows[i][1],
//           tlgm_id: rows[i][2],
//           status: rows[i][3],
//           comment: rows[i][4]
//         });
//     }

//     return rowsJSON;
// }

function convertRowsToJSONTableTask(rows) {
  let rowsJSON = [];
  for (let i = 1; i < rows.length; i++) {
    rowsJSON.push({
      id: rows[i][0],
      name: rows[i][1],
      project_name: rows[i][2],
      assignee: rows[i][3],
      assignee_to: rows[i][4],
      priority: rows[i][5],
      description: rows[i][6],
      status: rows[i][7],
    });
  }

  return rowsJSON;
}

function convertRowsToJSONTableProjects(rows) {
  let rowsJSON = [];
  for (let i = 1; i < rows.length; i++) {
    rowsJSON.push({
      id: rows[i][0],
      project_id: rows[i][1],
      project_name: rows[i][2],
      employee_name: rows[i][3],
      tlgm_id: rows[i][4],
      status: rows[i][5],
    });
  }

  return rowsJSON;
}

function convertRowsToJSONTableUsers(rows) {
  let rowsJSON = [];
  for (let i = 1; i < rows.length; i++) {
    rowsJSON.push({
      id: rows[i][0],
      name: rows[i][1],
      tlgm_id: rows[i][2],
      assignee_name: rows[i][3],
      assignee_id: rows[i][4],
      status: rows[i][5],
    });
  }

  // console.log(rowsJSON);

  return rowsJSON;
}

class GoogleSheet {
  constructor() {}

  async #getAccessTheTable() {
    const auth = new google.auth.GoogleAuth({
      keyFile: process.env.KEY_FILE,
      scopes: process.env.SCOPES,
    });

    const client = await auth.getClient();
    const googleSheets = google.sheets({ version: 'v4', auth: client });

    return { auth, googleSheets };
  }

  async clearSheet({ spreadsheetId, range }) {
    const { auth, googleSheets } = await this.#getAccessTheTable();
    const request = {
      spreadsheetId,
      range,
      resource: {
      },
      auth,
    };
  
    try {
      const response = (await sheets.spreadsheets.values.clear(request)).data;
      // TODO: Change code below to process the `response` object:
    } catch (err) {
      console.error(err.message);
    }
  }

  async batchUpdateValues({ spreadsheetId, range, valueInputOption, values }) {
    const { auth, googleSheets } = await this.#getAccessTheTable();

    const data = [
      {
        range,
        values,
      },
    ];

    const resource = {
      data,
      valueInputOption,
    };
    try {
      const result = await googleSheets.spreadsheets.values.batchUpdate({
        spreadsheetId,
        resource,
      });
      console.log('%d cells updated.', result.data.totalUpdatedCells);
      return result;
    } catch (err) {
      console.log(`ERROR: ${err.message}`);
      // TODO (developer) - Handle exception
      // throw err;
    }
  }

  async getDataFromSheet(tableName) {
    try {
      const { auth, googleSheets } = await this.#getAccessTheTable();

      const getRows = await googleSheets.spreadsheets.values.get({
        auth: auth,
        spreadsheetId: process.env.SPREED_SHEET_ID,
        range: tableName,
      });

      const rows = getRows.data.values;

      if (tableName === 'white_list') return convertRowsToJSONWhiteList(rows);
      else if (tableName === 'table_task')
        return convertRowsToJSONTableTask(rows);
      else if (tableName === 'table_users')
        return convertRowsToJSONTableUsers(rows);
      else if (tableName === 'table_projects')
        return convertRowsToJSONTableProjects(rows);
    } catch (e) {
      console.log(e.message);
    }
  }

  async writeDataToTableTask({ tableName, task }) {
    try {
      const { auth, googleSheets } = await this.#getAccessTheTable();

      let dataFromTable = await this.getDataFromSheet(tableName);
      let dataFromTableNum = (await this.getDataFromSheet(tableName)).length + 1;

      if (dataFromTable.length === 0) dataFromTableNum = 1;

      googleSheets.spreadsheets.values.update({
        auth: auth,
        spreadsheetId: process.env.SPREED_SHEET_ID,
        range: `${tableName}!A${Number(dataFromTableNum) + 1}`,
        valueInputOption: 'USER_ENTERED',
        resource: {
          values: [[`${dataFromTableNum}`]],
        },
      });

      googleSheets.spreadsheets.values.update({
        auth: auth,
        spreadsheetId: process.env.SPREED_SHEET_ID,
        range: `${tableName}!B${dataFromTableNum + 1}`,
        valueInputOption: 'USER_ENTERED',
        resource: {
          values: [[`${task.getHeader()}`]],
        },
      });

      googleSheets.spreadsheets.values.update({
        auth: auth,
        spreadsheetId: process.env.SPREED_SHEET_ID,
        range: `${tableName}!C${dataFromTableNum + 1}`,
        valueInputOption: 'USER_ENTERED',
        resource: {
          values: [[`${task.getProject()}`]],
        },
      });

      googleSheets.spreadsheets.values.update({
        auth: auth,
        spreadsheetId: process.env.SPREED_SHEET_ID,
        range: `${tableName}!D${dataFromTableNum + 1}`,
        valueInputOption: 'USER_ENTERED',
        resource: {
          values: [[`${task.getAssignFrom()}`]],
        },
      });

      googleSheets.spreadsheets.values.update({
        auth: auth,
        spreadsheetId: process.env.SPREED_SHEET_ID,
        range: `${tableName}!E${dataFromTableNum + 1}`,
        valueInputOption: 'USER_ENTERED',
        resource: {
          values: [[`${task.getAssignPerformer()}`]],
        },
      });

      googleSheets.spreadsheets.values.update({
        auth: auth,
        spreadsheetId: process.env.SPREED_SHEET_ID,
        range: `${tableName}!F${dataFromTableNum + 1}`,
        valueInputOption: 'USER_ENTERED',
        resource: {
          values: [[`${task.getPriority()}`]],
        },
      });

      googleSheets.spreadsheets.values.update({
        auth: auth,
        spreadsheetId: process.env.SPREED_SHEET_ID,
        range: `${tableName}!G${dataFromTableNum + 1}`,
        valueInputOption: 'USER_ENTERED',
        resource: {
          values: [[`${task.getDescription()}`]],
        },
      });
    } catch (e) {
      console.log(e.message);
    }
  }
}

export const googleSheet = new GoogleSheet();
