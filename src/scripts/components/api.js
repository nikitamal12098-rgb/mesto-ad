const config = {
    baseUrl: 'https://mesto.nomoreparties.co/v1/apf-cohort-202',
    headers: {
        authorization: '5dd414df-f037-4b54-b6b6-6d50ece37f97',
        'Content-Type': 'application/json'
    }
};

const getResponseData = (res) => {
    return res.ok ? res.json() : Promise.reject(`Ошибка: ${res.status}`);
};

export const getUserInfo = () => {
    return fetch(`${config.baseUrl}/users/me`, {
        headers: config.headers
    }).then(getResponseData);
}

export const getCardList = () => {
  return fetch(`${config.baseUrl}/cards`, { 
    headers: config.headers, 
  }).then(getResponseData);  
};

export const setUserInfo = ({name, about}) => {
    return fetch(`${config.baseUrl}/users/me`, {
        method: 'PATCH',
        headers: config.headers,
        body: JSON.stringify({
            name,
            about
        })
    }).then(getResponseData)
};

export const setUserAvatar = ({ avatar }) => {
    return fetch(`${config.baseUrl}/users/me`, {
        method: 'PATCH',
        headers: config.headers,
        body: JSON.stringify({ avatar })
    }).then(getResponseData);
};

export const getNewCard = ({ name, link }) => {
    return fetch(`${config.baseUrl}/cards`, {
        method: 'POST',
        headers: config.headers,
        body: JSON.stringify({
            name,
            link
        })
    }).then(getResponseData);
};

export const deleteCard = (cardId) => {
    return fetch(`${config.baseUrl}/cards/${cardId}`,  {
        headers: config.headers,
        method: 'DELETE',
    }).then(getResponseData);
};

export const changeLikeCardStatus = (cardID, isLiked) => {
    return fetch(`${config.baseUrl}/cards/likes/${cardID}`, {
        method: isLiked ? 'DELETE' : 'PUT',
        headers: config.headers
    }).then((res) => getResponseData(res));
};