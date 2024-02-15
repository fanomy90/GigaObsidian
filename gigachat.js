import axios from 'axios';
import https from 'https';
async function getAccessToken() {
    const apiUrl = 'https://ngw.devices.sberbank.ru:9443/api/v2/oauth';
    const requestBody = {
        scope: 'GIGACHAT_API_PERS',
    };
    const headers = {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
        'RqUID': '',
        'Authorization': '',
    };
    const axiosConfig = {
        headers,
        httpsAgent: new https.Agent({ rejectUnauthorized: false }), // Добавляем эту опцию для обхода проблемы с самоподписанным сертификатом
    };
    try {
        const response = await axios.post(apiUrl, requestBody, axiosConfig);
        if (response.status === 200) {
            const { access_token, expires_at } = response.data;
            console.log('Access Token:', access_token);
            return {
                access_token,
                expires_at,
            };
        } else {
            console.error('Error:', response.status, response.statusText);
            return null;
        }
    } catch (error) {
        console.error('Error:', error.message);
        return null;
    }
}
// Пример использования функции

getAccessToken()
    .then((tokenInfo) => {
        if (tokenInfo) {
            console.log('Access Token:', tokenInfo.access_token);
            console.log('Expires At:', new Date(tokenInfo.expires_at));
        } else {
            console.log('Failed to obtain access token.');
        }
    })
    .catch((error) => {
        console.error('Error:', error.message);
    });
//module.exports = getAccessToken;
//работа с сообщениями GigaChat
//экспортируем функцию которая принимает вопрос и возвращает ответ от GigaChat
//module.exports = sendChatCompletionRequest;
//export { sendChatCompletionRequest };
export { getAccessToken };