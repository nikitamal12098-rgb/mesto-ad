/*
  Файл index.js является точкой входа в наше приложение
  и только он должен содержать логику инициализации нашего приложения
  используя при этом импорты из других файлов

  Из index.js не допускается что то экспортировать
*/

import { changeLikeCardStatus, deleteCard, getNewCard, getCardList, getUserInfo, setUserAvatar, setUserInfo } from "./components/api.js";
import { createCardElement } from "./components/card.js";
import { openModalWindow, closeModalWindow, setCloseModalWindowEventListeners } from "./components/modal.js";
import { enableValidation, clearValidation } from "./components/validation.js";

const validationSettings = {
  formSelector: ".popup__form",
  inputSelector: ".popup__input",
  submitButtonSelector: ".popup__button",
  inactiveButtonClass: "popup__button_disabled",
  inputErrorClass: "popup__input_type_error",
  errorClass: "popup__error_visible",
};

enableValidation(validationSettings); 

// DOM узлы
const placesWrap = document.querySelector(".places__list");
const profileFormModalWindow = document.querySelector(".popup_type_edit");
const profileForm = profileFormModalWindow.querySelector(".popup__form");
const profileTitleInput = profileForm.querySelector(".popup__input_type_name");
const profileDescriptionInput = profileForm.querySelector(".popup__input_type_description");

const cardFormModalWindow = document.querySelector(".popup_type_new-card");
const cardForm = cardFormModalWindow.querySelector(".popup__form");
const cardNameInput = cardForm.querySelector(".popup__input_type_card-name");
const cardLinkInput = cardForm.querySelector(".popup__input_type_url");

const imageModalWindow = document.querySelector(".popup_type_image");
const imageElement = imageModalWindow.querySelector(".popup__image");
const imageCaption = imageModalWindow.querySelector(".popup__caption");

const openProfileFormButton = document.querySelector(".profile__edit-button");
const openCardFormButton = document.querySelector(".profile__add-button");

const profileTitle = document.querySelector(".profile__title");
const profileDescription = document.querySelector(".profile__description");
const profileAvatar = document.querySelector(".profile__image");

const avatarFormModalWindow = document.querySelector(".popup_type_edit-avatar");
const avatarForm = avatarFormModalWindow.querySelector(".popup__form");
const avatarInput = avatarForm.querySelector(".popup__input");

const cardInfoModalWindow = document.querySelector(".popup_type_info");
const cardInfoModalTitle = cardInfoModalWindow.querySelector(".popup__title");
const cardInfoModalInfoList = cardInfoModalWindow.querySelector(".popup__info");
const cardInfoModalText = cardInfoModalWindow.querySelector(".popup__text");
const cardInfoModalList = cardInfoModalWindow.querySelector(".popup__list");

let currentUserId;

// Функция для форматирования даты
const formatDate = (date) =>
  date.toLocaleDateString("ru-RU", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

const createInfoString = (term, description) => {
  const template = document.getElementById("popup-info-definition-template");
  const infoItem = template.content.cloneNode(true);
  
  infoItem.querySelector(".popup__info-term").textContent = term;
  infoItem.querySelector(".popup__info-description").textContent = description;
  
  return infoItem;
};

const createUserBadge = (user) => {
  const template = document.getElementById("popup-info-user-preview-template");
  const userItem = template.content.cloneNode(true);
  const badge = userItem.querySelector(".popup__list-item_type_badge");

  badge.backgroundImage = `url(${user.avatar})`;
  badge.textContent = user.name || user.about || "Аноним";

  return userItem;
}

const handleInfoClick = (cardId) => {
  cardInfoModalInfoList.innerHTML = '';
  cardInfoModalList.innerHTML = '';

  getCardList()
    .then((cards) => {
      const cardData = cards.find(card => card._id === cardId);

      cardInfoModalTitle.textContent = "Информация о карточке";

      cardInfoModalInfoList.append(createInfoString("Описание:", cardData.about));
      cardInfoModalInfoList.append(
        createInfoString("Дата создания:", formatDate(new Date(cardData.createdAt)))
      );
      cardInfoModalInfoList.append(createInfoString("Владелец:", cardData.name));
      cardInfoModalInfoList.append(
        createInfoString("Количество лайков:", cardData.likes.length.toString())
      );

      cardInfoModalText.textContent = "Лайкнули:";

      cardData.likes.forEach(user => {
        cardInfoModalList.append(createUserBadge(user));
      });

      if (cardData.likes.length === 0) {
        const noLikesItem = document.createElement(`li`);
        noLikesItem.className = 'popup__list-item';
        noLikesItem.textContent = 'Нет лайков';
        cardInfoModalList.appendChild(noLikesItem);
      }

      openModalWindow(cardInfoModalWindow);
    })
    .catch((err) => {
      console.log(err);
    });
};

const handlePreviewPicture = ({ name, link }) => {
  imageElement.src = link;
  imageElement.alt = name;
  imageCaption.textContent = name;
  openModalWindow(imageModalWindow);
};

const handleProfileFormSubmit = (evt) => {
  evt.preventDefault();
  renderLoading(evt.submitter, true, 'Сохранить', 'Сохранение...');
  setUserInfo({
    name: profileTitleInput.value,
    about: profileDescriptionInput.value
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
      renderLoading(evt.submitter, false, 'Сохранить');
    })
};

const handleAvatarFromSubmit = (evt) => {
  evt.preventDefault();
  renderLoading(evt.submitter, true, 'Сохранить', 'Сохранение...');
  setUserAvatar({
    avatar: avatarInput.value
  })
    .then((userData) => {
      profileAvatar.style.backgroundImage = `url(${userData.avatar})`;
      closeModalWindow(avatarFormModalWindow);
    })
    .catch((err) => {
      console.log(err);
    })
    .finally(() => {
      renderLoading(evt.submitter, false, 'Сохранить');
    });
};

const handleCardFormSubmit = (evt) => {
  evt.preventDefault();
  renderLoading(evt.submitter, true, 'Создать', 'Создание...');
  getNewCard({
    name: cardNameInput.value,
    link: cardLinkInput.value,
  })
    .then((userData) => {
      placesWrap.prepend(
        createCardElement(userData, {
          onPreviewPicture: handlePreviewPicture,
          onLikeIcon: hadleLikeCard,
          onDeleteCard: handleDeleteCard,
          onInfoClick: handleInfoClick,
          userId: currentUserId
        })
      );
      closeModalWindow(cardFormModalWindow);
    })
    .catch((err) => {
      console.log(err);
    })
    .finally(() => {
      renderLoading(evt.submitter, false, 'Создать');
    });
};

const handleDeleteCard = (cardElement, cardId) => {
  deleteCard(cardId)
    .then(() => {
      cardElement.remove();
    })
    .catch((err) => {
      console.log(err);
    });
};

const hadleLikeCard = (likeButton, cardID, likeCounter) => {
  const isLiked = likeButton.classList.contains("card__like-button_is-active");
  
  changeLikeCardStatus(cardID, isLiked)
    .then((updatedCard) => {
      likeButton.classList.toggle("card__like-button_is-active");
      likeCounter.textContent = updatedCard.likes.length
    })
    .catch((err) => {
      console.log(err);
    });
};

const renderLoading = (button, isloading, defaultText, loadingText) => {
  button.disabled = isloading;
  button.textContent = isloading ? loadingText : defaultText;
}

// EventListeners
profileForm.addEventListener("submit", handleProfileFormSubmit);
cardForm.addEventListener("submit", handleCardFormSubmit);
avatarForm.addEventListener("submit", handleAvatarFromSubmit);

openProfileFormButton.addEventListener("click", () => {
  profileTitleInput.value = profileTitle.textContent;
  profileDescriptionInput.value = profileDescription.textContent;

  clearValidation(profileForm, validationSettings);

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

//настраиваем обработчики закрытия попапов
const allPopups = document.querySelectorAll(".popup");
allPopups.forEach((popup) => {
  setCloseModalWindowEventListeners(popup);
});

Promise.all([getCardList(), getUserInfo()])
  .then(([cards, userData]) =>  {
    currentUserId = userData._id;
    profileAvatar.style.backgroundImage = `url(${userData.avatar})`;
    profileDescription.textContent = userData.about;
    profileTitle.textContent = userData.name;

    cards.forEach((card) => {
      placesWrap.append(
        createCardElement(card, {
          onPreviewPicture: handlePreviewPicture,
          onLikeIcon: hadleLikeCard,
          onDeleteCard: handleDeleteCard,
          onInfoClick: handleInfoClick,
          userId: currentUserId
        })
      );
    });
  })
  .catch((err) => {
    console.log(err);
  });