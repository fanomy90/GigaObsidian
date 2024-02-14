const axios = require('axios');
const https = require('https'); // Добавляем эту строку для использования модуля https
const currentTimestamp = new Date().getTime();
const int64Timestamp = BigInt(currentTimestamp);

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
            accessTokenInfo = {
                access_token: response.data.access_token,
                expires_at: response.data.expires_at,
            };
            console.log('Получен новый токен: ', accessTokenInfo.access_token);
            console.log('Новый токен будет доступен до: ', new Date(accessTokenInfo.expires_at));
            console.log('Текущее время ', int64Timestamp);
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
module.exports = getAccessToken;