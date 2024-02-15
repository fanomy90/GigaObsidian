import axios from 'axios';
import https from 'https';
//обработка получения токена
let accessTokenInfo = null;
async function getAccessToken() {
    if (accessTokenInfo) {
        const expirationTime = new Date(accessTokenInfo.expires_at).getTime();
        const currentTime = new Date().getTime();
        console.log('Expiration Time:', expirationTime);
        console.log('Current Time:', currentTime);
        if (expirationTime > currentTime) {
            // Возвращаем действующий токен, если он еще действителен
            console.log('Возврат сформированного ранее токена: ', accessTokenInfo.access_token);
            return accessTokenInfo.access_token;
        } else {
            console.log('Токен истек или недействителен. Формирование нового токена.');
        }
    } else {
        console.log('accessTokenInfo не определён или равен null. Запрашиваем новый токен.');
    }
    // Иначе запрашиваем новый токен
    const apiUrl = 'https://ngw.devices.sberbank.ru:9443/api/v2/oauth';
    const requestBody = {
        scope: 'GIGACHAT_API_PERS',
    };
    const headers = {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
        'RqUID': '89a05b68-c017-4799-a3a3-2a13acc0aa0f',
        'Authorization': 'Basic N2NmY2YxOWEtOWJmOS00ZDJkLWI0YTEtNzhkMmI1YTAwNjU1Ojg5YTA1YjY4LWMwMTctNDc5OS1hM2EzLTJhMTNhY2MwYWEwZg==',
    };

    const axiosConfig = {
        headers,
        httpsAgent: new https.Agent({ rejectUnauthorized: false }), // Добавляем эту опцию для обхода проблемы с самоподписанным сертификатом
    };
    try {
        const response = await axios.post(apiUrl, requestBody, axiosConfig);
        if (response.status === 200) {
            accessTokenInfo = {
                access_token: response.data.access_token,
                expires_at: response.data.expires_at,
            };
            console.log('Получен новый токен: ', accessTokenInfo.access_token);
            console.log('Новый токен будет доступен до: ', new Date(accessTokenInfo.expires_at));
            //console.log('Текущее время ', int64Timestamp);
            console.log('Время токена ', accessTokenInfo.expires_at);
            return accessTokenInfo.access_token;
        } else {
            console.error('Error:', response.status, response.statusText);
            return null;
        }
    } catch (error) {
        console.error('Error:', error.message);
        return null;
    }
}
//module.exports = getAccessToken;
//работа с сообщениями GigaChat
async function sendChatCompletionRequest(messageContent) {
    //получим токен из функции выше 
    messageContent = 'как похудеть';
    const accessToken = await getAccessToken();
    const apiUrl = 'https://gigachat.devices.sberbank.ru/api/v1/chat/completions';
    const requestData = {
        model: 'GigaChat:latest',
        messages: [
            {
                role: 'user',
                content: messageContent,
            },
        ],
        temperature: 1.0,
        top_p: 0.1,
        n: 1,
        stream: false,
        max_tokens: 512,
        repetition_penalty: 1,
    };
    const headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
    };
    const axiosConfig = {
        headers,
        httpsAgent: new https.Agent({ rejectUnauthorized: false }),
    };
    try {
        const response = await axios.post(apiUrl, requestData, { ...axiosConfig, httpsAgent: axiosConfig.httpsAgent });
        return response.data;
    } catch (error) {
        console.error('Error:', error.message);
        return null;
    }
}
//экспортируем функцию которая принимает вопрос и возвращает ответ от GigaChat
//module.exports = sendChatCompletionRequest;
export { sendChatCompletionRequest };
export { getAccessToken };