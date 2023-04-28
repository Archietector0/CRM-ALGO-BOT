export class Session {
  // Private vars
  #sessionNumber = 0;
  #firstName = '';
  #userName = '';
  #tasks = [];

  // Public vars
  state = 'unknown';
  action = 'unknown'
  mainMsgId = 0;
  idToDelete = []

  // Constuctor
  constructor({ sessionNumber, firstName, userName, tasks }) {
    this.#sessionNumber = sessionNumber;
    this.#firstName = firstName;
    this.#userName = userName;
    this.#tasks = tasks
    // this.mainMsgId = mainMsgId
  }

  // Add method
  addTask(task) {
    this.#tasks.push(task);
  }

  getLastTask() {
    return this.#tasks.at(-1);
  }

  getAllTasks() {
    return this.#tasks;
  }

  // Remove method
  removeLastTask() {
    this.#tasks.pop();
  }

  //  Set methods
  setState(state) {
    this.state = state;
  }

  setMainMsgId(mainMsgId) {
    this.mainMsgId = mainMsgId;
  }

  //  Get methods
  getState() {
    return this.state;
  }

  getMainMsgId() {
    return this.mainMsgId;
  }

  getSessionNumber() {
    return this.#sessionNumber;
  }

  getFirstName() {
    return this.#firstName;
  }

  getUserName() {
    return this.#userName;
  }
}
