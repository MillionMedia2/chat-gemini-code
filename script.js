const chatMessages = document.getElementById('chatMessages');
const messageInput = document.getElementById('messageInput');
const sendButton = document.getElementById('sendButton');

const webhookURL = 'https://plantz.app.n8n.cloud/webhook/53c136fe-3e77-4709-a143-fe82746dd8b6/chat';
let chatSessionId = null; // Store the chat session ID
let isFirstMessage = true; // Flag for the first message

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
        // Prepare the request body as JSON
        const requestBody = {
            chatInput: message,
            sessionId: chatSessionId,
            firstMessage: isFirstMessage, // Send the firstMessage flag
            metadata: {} //Example, empty
        };

        const response = await fetch(`${webhookURL}?action=sendMessage`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const responseData = await response.json();
        const reply = responseData.output; // Get reply from output
        chatSessionId = responseData.sessionId // Set session ID

        if (!reply){
          reply = JSON.stringify(responseData)
        }


        // After the first message, set the flag to false
        isFirstMessage = false;

        return reply;

    } catch (error) {
        console.error('Error sending message to webhook:', error);
        return "Sorry, there was an error processing your request.";
    }
}

// Load previous session on page load
async function loadPreviousSession() {
    try {
        const response = await fetch(`${webhookURL}?action=loadPreviousSession`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json', // Even for GET, be explicit
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

       const responseData = await response.json();

        if (responseData.sessionId) {
            chatSessionId = responseData.sessionId;
        }

        //ADD MESSAGES FROM PREVIOUS SESSION HERE if structure is known.

    } catch (error) {
        console.error('Error loading previous session:', error);
    }
}


sendButton.addEventListener('click', async () => {
    const messageText = messageInput.value.trim();
    if (messageText !== '') {
        addMessage(messageText, true);

        const reply = await sendMessageToWebhook(messageText);

        addMessage(reply, false);
        messageInput.value = '';
    }
});

messageInput.addEventListener('keydown', async (event) => {
    if (event.key === 'Enter') {
        event.preventDefault();
        sendButton.click();
    }
});

// Load previous session and scroll to bottom on initial load
loadPreviousSession();
chatMessages.scrollTop = chatMessages.scrollHeight;
