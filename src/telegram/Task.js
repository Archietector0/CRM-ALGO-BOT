export class Task {
  // Private vars
  #project = '';
  #header = '';
  #description = '';
  #priority = '';
  #assignPerformer = '';
  #assignFrom = '';

  // Constructor
  constructor(assignFrom) {
    this.#assignFrom = assignFrom
  }

  // Get methods
  getProject() {
    return this.#project;
  }
  getHeader() {
    return this.#header;
  }
  getDescription() {
    return this.#description;
  }
  getPriority() {
    return this.#priority;
  }
  getAssignPerformer() {
    return this.#assignPerformer;
  }
  getAssignFrom() {
    return this.#assignFrom;
  }

  // Set methods
  setProject(project) {
    this.#project = project ;
  }
  setHeader(header) {
    this.#header = header;
  }
  setDescription(description) {
    this.#description = description;
  }
  setPriority(priority) {
    this.#priority = priority;
  }
  setAssignPerformer(assignPerformer) {
    this.#assignPerformer = assignPerformer;
  }
  setAssignFrom(assignFrom) {
    this.#assignFrom = assignFrom;
  }
}

