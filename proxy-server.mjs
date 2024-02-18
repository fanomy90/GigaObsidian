import express from 'express';
import axios from 'axios';
import * as https from 'https';
import fs from 'fs';

const app = express();
const port = 3000;

// Загрузка SSL-сертификата
const certPath = 'C:\\Users\\skiner\\Documents\\OUTERHEAVEN\\russian_trusted_root_ca.cer';
const certBuffer = fs.readFileSync(certPath);

// Middleware для включения CORS
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});

// Middleware для обработки данных формы
app.use(express.urlencoded({ extended: true }));

// Middleware для включения CORS для HEAD запроса
app.head('/api/v2/oauth', (req, res) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    res.sendStatus(200);
});

// Middleware для включения CORS для OPTIONS запроса
app.options('/api/v2/oauth', (req, res) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, RqUID');
    res.sendStatus(200);
});

// Middleware для обработки POST запроса
app.post('/api/v2/oauth', async (req, res) => {
    const apiUrl = 'https://ngw.devices.sberbank.ru:9443/api/v2/oauth';

    try {
        // Использование HTTPS агента с загруженным сертификатом
        const agent = new https.Agent({ ca: certBuffer });

        const formData = new URLSearchParams();
        formData.append('scope', 'GIGACHAT_API_PERS');

        const response = await axios.post(apiUrl, formData, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept': 'application/json',
                'RqUID': '89a05b68-c017-4799-a3a3-2a13acc0aa0f',
                'Authorization': 'Basic N2NmY2YxOWEtOWJmOS00ZDJkLWI0YTEtNzhkMmI1YTAwNjU1Ojg5YTA1YjY4LWMwMTctNDc5OS1hM2EzLTJhMTNhY2MwYWEwZg==',
            },
            httpsAgent: agent,
        });

        res.header('Content-Type', 'application/json');
        res.json(response.data);
    } catch (error) {
        console.error('Error in proxy request:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.listen(port, () => {
    console.log(`Proxy server is listening at http://localhost:${port}`);
});
