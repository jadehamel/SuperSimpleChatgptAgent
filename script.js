document.addEventListener('DOMContentLoaded', function() {
  var apiKeyInput = document.getElementById('apikeyInput');
  var agentRole = document.getElementById('agentRole');
  var agentBot = document.getElementById('agentBot');
  var chatBox = document.getElementById('chat-box');
  var endPoint = "https://api.openai.com/v1/chat/completions";
  var AgentModel = "gpt-3.5-turbo";
  var AgentEndPoint = "https://api.openai.com/v1/chat/completions";
  var botModel = document.getElementById('agentModel');
  var botEndPoint = document.getElementById('agentEndPoint');
  botModel.value = AgentModel;
  botEndPoint.value = endPoint;

  function getCookieValue(cookieName) {
    var name = cookieName + '=';
    var decodedCookie = decodeURIComponent(document.cookie);
    var cookieArray = decodedCookie.split(';');
    for (var i = 0; i < cookieArray.length; i++) {
      var cookie = cookieArray[i].trim();
      if (cookie.indexOf(name) === 0) {
        return cookie.substring(name.length, cookie.length);
      }
    }
    return '';
  }

  var agentApiKeyValue = getCookieValue('agent_apikey');
  if (agentApiKeyValue !== '') {
    apiKeyInput.value = agentApiKeyValue;
  }

  apiKeyInput.addEventListener('input', function() {
    var apiKeyValue = apiKeyInput.value;
    document.cookie = 'agent_apikey=' + encodeURIComponent(apiKeyValue);
  });

  var agentRoleValue = getCookieValue('agent_role');
  if (agentRoleValue !== '') {
    agentRole.value = agentRoleValue;
  }

  agentRole.addEventListener('input', function() {
    var agentRoleValue = agentRole.value;
    document.cookie = 'agent_role=' + encodeURIComponent(agentRoleValue);
  });

  var agentBotValue = getCookieValue('agent_bot');
  if (agentBotValue !== '') {
    agentBot.value = agentBotValue;
  }

  // Event listener for Agent Bot select changes
  agentBot.addEventListener('change', function(event) {
    var agentBotValue = agentBot.value;
    AgentEndPoint = (agentBotValue === "Llama") ? "http://localhost:1234/v1/chat/completions" : "https://api.openai.com/v1/chat/completions";
    document.cookie = 'agent_bot=' + encodeURIComponent(agentBotValue);
    botModel.value = "gpt-3.5-turbo";
    botEndPoint.value = AgentEndPoint;
  });

  // Event listener for send button click
  document.getElementById('send-button').addEventListener('click', sendMessage);

  // Event listener for user input enter key press
  document.getElementById('user-input').addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
      sendMessage();
    }
  });

  async function sendMessage() {
    const inputField = document.getElementById('user-input');
    const userMessage = inputField.value.trim();

    if (userMessage === '') {
      return;
    }

    appendMessage('user', userMessage);
    inputField.value = '';

    const botMessage = await getBotResponse(userMessage);
    appendMessage('bot', botMessage);
  }

  function appendMessage(sender, message) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message', sender);
    const messageContent = document.createElement('p');
    messageContent.textContent = message;
    messageElement.appendChild(messageContent);
    chatBox.appendChild(messageElement);
    chatBox.scrollTop = chatBox.scrollHeight;
  }

  async function getBotResponse(userMessage) {
    const apiKey = apiKeyInput.value || 'YOUR_API_KEY';  // Replace with your OpenAI API key
    const endpoint = AgentEndPoint || 'https://api.openai.com/v1/chat/completions';
    const payload = {
      model: AgentModel,
      messages: [
        { role: "system", content: agentRole.value || "You are a friendly and helpful assistant named Alex. You are knowledgeable in technology, science, and literature. Always be polite and use simple, easy-to-understand language." },
        { role: "user", content: userMessage }
      ],
      max_tokens: 150,
      temperature: 0.5,
      top_p: 0.9,
      frequency_penalty: 0.5,
      presence_penalty: 0.5
    };

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      if (data.choices && data.choices.length > 0) {
        return data.choices[0].message.content.trim();
      } else {
        if (data.error && data.error.message) {
          return '(' + data.error.code + ') ' + data.error.message;
        } else {
          return 'Sorry, I am having trouble responding at the moment. Please try again later.';
        }
      }
    } catch (error) {
      console.error('Error:', error);
      return 'Sorry, I am having trouble responding at the moment. Please try again later.';
    }
  }
});