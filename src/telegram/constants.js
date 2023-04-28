export const CREATE_TASK_KEYBOARD = {
  inline_keyboard: [
    [
      {
        text: 'Заголовок',
        callback_data: 'input_header',
      },
      {
        text: 'Описание',
        callback_data: 'input_description',
      },
      {
        text: 'Приоритет',
        callback_data: 'choose_priority',
      },
    ],
    [
      {
        text: 'Выбрать исполнителя',
        callback_data: 'choose_performer',
      },
    ],
    [
      {
        text: 'Завершить',
        callback_data: 'finish_task',
      },
      {
        text: 'Отменить',
        callback_data: 'cancel_task',
      },
    ],
  ],
};

export const CHOOSE_PRIORITY_KEYBOARD = {
  inline_keyboard: [
    [
      {
        text: 'Срочное',
        callback_data: 'urgent',
      },
      {
        text: 'Важное',
        callback_data: 'important',
      },
      {
        text: 'Срочное важное',
        callback_data: 'urgent_important',
      },
    ],
    [
      {
        text: 'Без приоритета',
        callback_data: 'without_priority',
      },
    ],
  ],
};

export const CHOOSE_PROJECT_KEYBOARD = {
  inline_keyboard: [
    [
      {
        text: 'Парсер',
        callback_data: 'chosen_project_parser',
      },
    ],
    [
      {
        text: 'Бухгалтерия',
        callback_data: 'chosen_project_account_department',
      },
    ],
    [
      {
        text: 'Назад',
        callback_data: 'back_to_main_menu',
      },
    ],
  ],
};

export const DELETE_CURRENT_TASK_KEYBOARD = {
  inline_keyboard: [
    [{
      text: 'Назад',
      callback_data: 'delete_tasks_back_to_main_menu'
    }]
  ]
}

export const GREETING_KEYBOARD = {
  inline_keyboard: [
    [{
      text: 'Мои задачи',
      callback_data: 'show_tasks'
    }, {
      text: 'Создать задачу',
      callback_data: 'create_task',
    }], [{
      text: 'Назначенные задачи',
      callback_data: 'show_other_tasks'
    }, {
      text: 'Мой id',
      callback_data: 'get_telegram_id',
    }],
  ],
};

export const BACK_MAIN_MENU_KEYBOARD = {
  inline_keyboard: [
    [
      {
        text: 'Назад',
        callback_data: 'back_to_main_menu',
      },
    ],
  ],
};

export const EMPTY_FIELD_KEYBOARD = {
  inline_keyboard: [
    [
      {
        text: 'Исправить',
        callback_data: 'correct_empty_field',
      },
    ],
  ],
};
