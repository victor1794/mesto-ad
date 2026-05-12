import {
  addCard,
  changeLikeCardStatus,
  deleteCard,
  getCardList,
  getUserInfo,
  setUserAvatar,
  setUserInfo,
} from "./components/api.js";

import {
  createCardElement,
  removeCardElement,
  updateCardLikes,
} from "./components/card.js";

import {
  closeModalWindow,
  openModalWindow,
  setCloseModalWindowEventListeners,
} from "./components/modal.js";

import {
  clearValidation,
  enableValidation,
} from "./components/validation.js";

const validationSettings = {
  formSelector: ".popup__form",
  inputSelector: ".popup__input",
  submitButtonSelector: ".popup__button",
  inactiveButtonClass: "popup__button_disabled",
  inputErrorClass: "popup__input_type_error",
  errorClass: "popup__error_visible",
};

const placesWrap = document.querySelector(".places__list");

const profileFormModalWindow = document.querySelector(".popup_type_edit");
const profileForm = profileFormModalWindow.querySelector(".popup__form");
const profileTitleInput = profileForm.querySelector(".popup__input_type_name");
const profileDescriptionInput = profileForm.querySelector(
  ".popup__input_type_description"
);

const cardFormModalWindow = document.querySelector(".popup_type_new-card");
const cardForm = cardFormModalWindow.querySelector(".popup__form");
const cardNameInput = cardForm.querySelector(".popup__input_type_card-name");
const cardLinkInput = cardForm.querySelector(".popup__input_type_url");

const avatarFormModalWindow = document.querySelector(".popup_type_edit-avatar");
const avatarForm = avatarFormModalWindow.querySelector(".popup__form");
const avatarInput = avatarForm.querySelector(".popup__input_type_avatar");

const imageModalWindow = document.querySelector(".popup_type_image");
const imageElement = imageModalWindow.querySelector(".popup__image");
const imageCaption = imageModalWindow.querySelector(".popup__caption");

const usersStatsModalWindow = document.querySelector(".popup_type_info");
const usersStatsModalInfoList = usersStatsModalWindow.querySelector(
  ".popup__info-list"
);
const usersStatsModalUsersList = usersStatsModalWindow.querySelector(
  ".popup__users-list"
);

const openProfileFormButton = document.querySelector(".profile__edit-button");
const openCardFormButton = document.querySelector(".profile__add-button");
const logoElement = document.querySelector(".logo");

const profileTitle = document.querySelector(".profile__title");
const profileDescription = document.querySelector(".profile__description");
const profileAvatar = document.querySelector(".profile__image");

let currentUserId = null;

const setButtonText = (formElement, text) => {
  const buttonElement = formElement.querySelector(".popup__button");
  buttonElement.textContent = text;
};

const formatDate = (date) =>
  date.toLocaleDateString("ru-RU", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

const createInfoString = (title, value) => {
  const infoElement = document
    .getElementById("popup-info-definition-template")
    .content.querySelector(".popup__info-item")
    .cloneNode(true);

  const infoTitle = infoElement.querySelector(".popup__info-term");
  const infoValue = infoElement.querySelector(".popup__info-definition");

  infoTitle.textContent = title;
  infoValue.textContent = value;

  return infoElement;
};

const createUserPreview = (userData, cardsCount) => {
  const userPreviewElement = document
    .getElementById("popup-info-user-preview-template")
    .content.querySelector(".popup__user-preview")
    .cloneNode(true);

  const avatarElement = userPreviewElement.querySelector(
    ".popup__user-preview-avatar"
  );
  const nameElement = userPreviewElement.querySelector(
    ".popup__user-preview-name"
  );
  const countElement = userPreviewElement.querySelector(
    ".popup__user-preview-count"
  );

  avatarElement.src = userData.avatar;
  avatarElement.alt = userData.name;
  nameElement.textContent = userData.name;
  countElement.textContent = cardsCount;

  return userPreviewElement;
};

const getUsersStats = (cards) => {
  const usersMap = new Map();

  cards.forEach((card) => {
    const ownerId = card.owner._id;

    if (!usersMap.has(ownerId)) {
      usersMap.set(ownerId, {
        user: card.owner,
        cardsCount: 1,
      });
    } else {
      usersMap.get(ownerId).cardsCount += 1;
    }
  });

  return Array.from(usersMap.values()).sort(
    (firstUser, secondUser) => secondUser.cardsCount - firstUser.cardsCount
  );
};

const clearUsersStatsModal = () => {
  usersStatsModalInfoList.replaceChildren();
  usersStatsModalUsersList.replaceChildren();
};

const handleLogoClick = () => {
  getCardList()
    .then((cards) => {
      clearUsersStatsModal();

      usersStatsModalInfoList.append(
        createInfoString("Всего карточек:", cards.length)
      );

      usersStatsModalInfoList.append(
        createInfoString("Всего пользователей:", getUsersStats(cards).length)
      );

      if (cards.length > 0) {
        usersStatsModalInfoList.append(
          createInfoString(
            "Первая создана:",
            formatDate(new Date(cards[cards.length - 1].createdAt))
          )
        );

        usersStatsModalInfoList.append(
          createInfoString(
            "Последняя создана:",
            formatDate(new Date(cards[0].createdAt))
          )
        );
      }

      getUsersStats(cards).forEach(({ user, cardsCount }) => {
        usersStatsModalUsersList.append(createUserPreview(user, cardsCount));
      });

      openModalWindow(usersStatsModalWindow);
    })
    .catch((err) => {
      console.log(err);
    });
};

const renderCard = (cardData, method = "append") => {
  const cardElement = createCardElement(cardData, currentUserId, {
    onPreviewPicture: handlePreviewPicture,
    onLikeIcon: handleLikeCard,
    onDeleteCard: handleDeleteCard,
  });

  placesWrap[method](cardElement);
};

const handlePreviewPicture = ({ name, link }) => {
  imageElement.src = link;
  imageElement.alt = name;
  imageCaption.textContent = name;
  openModalWindow(imageModalWindow);
};

const handleLikeCard = (cardData, cardElement) => {
  const isLiked = cardData.likes.some((user) => user._id === currentUserId);

  changeLikeCardStatus(cardData._id, isLiked)
    .then((newCardData) => {
      cardData.likes = newCardData.likes;
      updateCardLikes(cardElement, newCardData, currentUserId);
    })
    .catch((err) => {
      console.log(err);
    });
};

const handleDeleteCard = (cardId, cardElement) => {
  deleteCard(cardId)
    .then(() => {
      removeCardElement(cardElement);
    })
    .catch((err) => {
      console.log(err);
    });
};

const handleProfileFormSubmit = (evt) => {
  evt.preventDefault();

  setButtonText(profileForm, "Сохранение...");

  setUserInfo({
    name: profileTitleInput.value,
    about: profileDescriptionInput.value,
  })
    .then((userData) => {
      profileTitle.textContent = userData.name;
      profileDescription.textContent = userData.about;
      closeModalWindow(profileFormModalWindow);
    })
    .catch((err) => {
      console.log(err);
    })
    .finally(() => {
      setButtonText(profileForm, "Сохранить");
    });
};

const handleAvatarFormSubmit = (evt) => {
  evt.preventDefault();

  setButtonText(avatarForm, "Сохранение...");

  setUserAvatar({
    avatar: avatarInput.value,
  })
    .then((userData) => {
      profileAvatar.style.backgroundImage = `url(${userData.avatar})`;
      closeModalWindow(avatarFormModalWindow);
      avatarForm.reset();
      clearValidation(avatarForm, validationSettings);
    })
    .catch((err) => {
      console.log(err);
    })
    .finally(() => {
      setButtonText(avatarForm, "Сохранить");
    });
};

const handleCardFormSubmit = (evt) => {
  evt.preventDefault();

  setButtonText(cardForm, "Создание...");

  addCard({
    name: cardNameInput.value,
    link: cardLinkInput.value,
  })
    .then((cardData) => {
      renderCard(cardData, "prepend");
      closeModalWindow(cardFormModalWindow);
      cardForm.reset();
      clearValidation(cardForm, validationSettings);
    })
    .catch((err) => {
      console.log(err);
    })
    .finally(() => {
      setButtonText(cardForm, "Создать");
    });
};

profileForm.addEventListener("submit", handleProfileFormSubmit);
cardForm.addEventListener("submit", handleCardFormSubmit);
avatarForm.addEventListener("submit", handleAvatarFormSubmit);

openProfileFormButton.addEventListener("click", () => {
  profileTitleInput.value = profileTitle.textContent;
  profileDescriptionInput.value = profileDescription.textContent;

  clearValidation(profileForm, validationSettings);

  profileTitleInput.dispatchEvent(new Event("input"));
  profileDescriptionInput.dispatchEvent(new Event("input"));

  openModalWindow(profileFormModalWindow);
});

profileAvatar.addEventListener("click", () => {
  avatarForm.reset();
  clearValidation(avatarForm, validationSettings);
  openModalWindow(avatarFormModalWindow);
});

openCardFormButton.addEventListener("click", () => {
  cardForm.reset();
  clearValidation(cardForm, validationSettings);
  openModalWindow(cardFormModalWindow);
});

logoElement.addEventListener("click", handleLogoClick);

const allPopups = document.querySelectorAll(".popup");

allPopups.forEach((popup) => {
  setCloseModalWindowEventListeners(popup);
});

enableValidation(validationSettings);

Promise.all([getCardList(), getUserInfo()])
  .then(([cards, userData]) => {
    currentUserId = userData._id;

    profileTitle.textContent = userData.name;
    profileDescription.textContent = userData.about;
    profileAvatar.style.backgroundImage = `url(${userData.avatar})`;

    cards.forEach((cardData) => {
      renderCard(cardData);
    });
  })
  .catch((err) => {
    console.log(err);
  });