// Функция показа ошибки
const showInputError = (formElement, inputElement, settings, errorMessage) => {
  const errorElement = formElement.querySelector(`#${inputElement.id}-error`);
  inputElement.classList.add(settings.inputErrorClass);
  errorElement.textContent = errorMessage;
  errorElement.classList.add(settings.errorClass);
};

// Функция скрытия ошибки
const hideInputError = (formElement, inputElement, settings) => {
  const errorElement = formElement.querySelector(`#${inputElement.id}-error`);
  inputElement.classList.remove(settings.inputErrorClass);
  errorElement.classList.remove(settings.errorClass);
  errorElement.textContent = '';
};

// Проверка валидности конкретного поля
const checkInputValidity = (formElement, inputElement, settings) => {
  if (inputElement.validity.valid) {
    hideInputError(formElement, inputElement, settings);
  } else {
    // Если ошибка связана с patternMismatch и есть кастомное сообщение – показываем его
    const errorMessage =
      inputElement.validity.patternMismatch && inputElement.dataset.errorMessage
        ? inputElement.dataset.errorMessage
        : inputElement.validationMessage;
    showInputError(formElement, inputElement, settings, errorMessage);
  }
};

// Проверка наличия хотя бы одного невалидного поля
const hasInvalidInput = (inputList) => {
  return inputList.some((inputElement) => !inputElement.validity.valid);
};

// Функции для управления кнопкой отправки
const disableSubmitButton = (buttonElement, settings) => {
  buttonElement.classList.add(settings.inactiveButtonClass);
  buttonElement.disabled = true;
};

const enableSubmitButton = (buttonElement, settings) => {
  buttonElement.classList.remove(settings.inactiveButtonClass);
  buttonElement.disabled = false;
};

// Переключение состояния кнопки в зависимости от валидности всех полей
const toggleButtonState = (inputList, buttonElement, settings) => {
  if (hasInvalidInput(inputList)) {
    disableSubmitButton(buttonElement, settings);
  } else {
    enableSubmitButton(buttonElement, settings);
  }
};

// Установка обработчиков на все поля формы
const setEventListeners = (formElement, settings) => {
  const inputList = Array.from(formElement.querySelectorAll(settings.inputSelector));
  const buttonElement = formElement.querySelector(settings.submitButtonSelector);

  toggleButtonState(inputList, buttonElement, settings); // начальное состояние

  inputList.forEach((inputElement) => {
    inputElement.addEventListener('input', () => {
      checkInputValidity(formElement, inputElement, settings);
      toggleButtonState(inputList, buttonElement, settings);
    });
  });
};

// Очистка ошибок валидации и отключение кнопки
export const clearValidation = (formElement, settings) => {
  const inputList = Array.from(formElement.querySelectorAll(settings.inputSelector));
  const buttonElement = formElement.querySelector(settings.submitButtonSelector);

  inputList.forEach((inputElement) => {
    hideInputError(formElement, inputElement, settings);
  });

  disableSubmitButton(buttonElement, settings);
};

// Включение валидации для всех форм на странице
export const enableValidation = (settings) => {
  const formList = Array.from(document.querySelectorAll(settings.formSelector));
  formList.forEach((formElement) => {
    setEventListeners(formElement, settings);
  });
};