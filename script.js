const chatMessages = document.getElementById('chatMessages');
const messageInput = document.getElementById('messageInput');
const sendButton = document.getElementById('sendButton');

const webhookURL = 'https://plantz.app.n8n.cloud/webhook/53c136fe-3e77-4709-a143-fe82746dd8b6/chat';
let chatSessionId = null; // Store the chat session ID

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
            chatInput: message, //Confirmed name of the value to pass
            sessionId: chatSessionId  // Include the session ID if available
        };

        const response = await fetch(`${webhookURL}?action=sendMessage`, { //ACTION QUERY PARAM
            method: 'POST',
            headers: {
                'Content-Type': 'application/json' //Content-Type JSON
            },
            body: JSON.stringify(requestBody) //Stringify the JSON
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const responseData = await response.json(); // Parse JSON response
        const reply = responseData.output; // Extract the 'output' property

        //If there isn't a output, return the whole data.
        if (!reply){
          reply = JSON.stringify(responseData)
        }

        // Update the chat session ID if it's returned in the response
        if (responseData.sessionId) {
            chatSessionId = responseData.sessionId;
        }

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
