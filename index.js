const axios = require('axios');
const https = require('https');
const getAccessToken = require('./token'); // Путь к файлу token.js

async function sendChatCompletionRequest(accessToken, messageContent) {
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
        const response = await axios.post(apiUrl, requestData, axiosConfig);
        return response.data;
    } catch (error) {
        console.error('Error:', error.message);
        return null;
    }
}

// Пример использования
(async () => {
    try {
        // Получаем токен, вызывая функцию из другого файла
        const accessToken = await getAccessToken();

        if (accessToken) {
            const response = await sendChatCompletionRequest(accessToken, 'Привет! Как дела?');

            if (response) {
                //console.log('Ответ модели:', response);
                const assistantResponse = response.choices[0].message.content;
                console.log('Ответ модели:', assistantResponse);
            } else {
                console.log('Не удалось получить ответ от модели.');
            }
        } else {
            console.log('Не удалось получить токен доступа.');
        }
    } catch (error) {
        console.error('Error:', error.message);
    }
})();
