const chatMessages = document.getElementById('chatMessages');
const messageInput = document.getElementById('messageInput');
const sendButton = document.getElementById('sendButton');

const webhookURL = 'https://plantz.app.n8n.cloud/webhook/53c136fe-3e77-4709-a143-fe82746dd8b6/chat';

function addMessage(message, isUser) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message');
    messageDiv.classList.add(isUser ? 'user-message' : 'bot-message');
    messageDiv.textContent = message;
    chatMessages.appendChild(messageDiv);

    // Scroll to bottom of chat messages
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

async function sendMessageToWebhook(message) {
    try {
        const response = await fetch(webhookURL, {
            method: 'POST',
            headers: {
                'Content-Type': 'text/plain' // Important: Specify content type
            },
            body: message
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const reply = await response.text(); // Get plain text response
        return reply;

    } catch (error) {
        console.error('Error sending message to webhook:', error);
        return "Sorry, there was an error processing your request."; // Simple error message
    }
}

sendButton.addEventListener('click', async () => {
    const messageText = messageInput.value.trim();
    if (messageText !== '') {
        addMessage(messageText, true); // Add user message

        const reply = await sendMessageToWebhook(messageText);

        addMessage(reply, false); // Add bot message
        messageInput.value = ''; // Clear input
    }
});

messageInput.addEventListener('keydown', async (event) => {
    if (event.key === 'Enter') {
        event.preventDefault(); // Prevent form submission on Enter
        sendButton.click(); // Trigger send button click
    }
});

// Scroll to bottom on initial load
chatMessages.scrollTop = chatMessages.scrollHeight;