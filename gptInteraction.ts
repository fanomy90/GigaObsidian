export function sendToChatGPT(selectedText: string): Promise<string> {
    const apiUrl = 'https://your-gpt-api-url';

    return fetch(apiUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: selectedText }),
    })
    .then(response => response.json())
    .then(data => data.response)
    .catch(error => {
        console.error('Error sending request to ChatGPT:', error);
        return '';
    });
}
