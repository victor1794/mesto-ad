const getTemplate = () => {
  return document
    .getElementById("card-template")
    .content.querySelector(".card")
    .cloneNode(true);
};

export const isCardLikedByUser = (cardData, userId) => {
  return cardData.likes.some((user) => user._id === userId);
};

export const removeCardElement = (cardElement) => {
  cardElement.remove();
};

export const updateCardLikes = (cardElement, cardData, userId) => {
  const likeButton = cardElement.querySelector(".card__like-button");
  const likeCount = cardElement.querySelector(".card__like-count");

  likeCount.textContent = cardData.likes.length;

  if (isCardLikedByUser(cardData, userId)) {
    likeButton.classList.add("card__like-button_is-active");
  } else {
    likeButton.classList.remove("card__like-button_is-active");
  }
};

export const createCardElement = (
  cardData,
  userId,
  { onPreviewPicture, onLikeIcon, onDeleteCard }
) => {
  const cardElement = getTemplate();
  const cardImage = cardElement.querySelector(".card__image");
  const cardTitle = cardElement.querySelector(".card__title");
  const likeButton = cardElement.querySelector(".card__like-button");
  const deleteButton = cardElement.querySelector(
    ".card__control-button_type_delete"
  );
  const likeCount = cardElement.querySelector(".card__like-count");

  cardImage.src = cardData.link;
  cardImage.alt = cardData.name;
  cardTitle.textContent = cardData.name;
  likeCount.textContent = cardData.likes.length;

  if (isCardLikedByUser(cardData, userId)) {
    likeButton.classList.add("card__like-button_is-active");
  }

  if (cardData.owner._id !== userId) {
    deleteButton.remove();
  } else {
    deleteButton.addEventListener("click", () => {
      onDeleteCard(cardData._id, cardElement);
    });
  }

  likeButton.addEventListener("click", () => {
    onLikeIcon(cardData, cardElement);
  });

  cardImage.addEventListener("click", () => {
    onPreviewPicture({
      name: cardData.name,
      link: cardData.link,
    });
  });

  return cardElement;
};