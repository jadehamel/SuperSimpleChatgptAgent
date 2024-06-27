document.addEventListener('DOMContentLoaded', function() {
  const apiKeyInput = document.getElementById('apikeyInput');
  const agentRole = document.getElementById('agentRole');
  const agentBot = document.getElementById('agentBot');
  const chatBox = document.getElementById('chat-box');
  const botModel = document.getElementById('agentModel');
  const botEndPoint = document.getElementById('agentEndPoint');

  const DEFAULT_API_ENDPOINT = "https://api.openai.com/v1/chat/completions";
  const DEFAULT_MODEL = "gpt-3.5-turbo";

  botModel.value = DEFAULT_MODEL;
  botEndPoint.value = DEFAULT_API_ENDPOINT;

  loadSettings();

  apiKeyInput.addEventListener('input', saveApiKey);
  agentRole.addEventListener('input', saveAgentRole);
  agentBot.addEventListener('change', updateBotSettings);
  document.getElementById('send-button').addEventListener('click', sendMessage);
  document.getElementById('user-input').addEventListener('keypress', function(event) {
    if (event.key === 'Enter') sendMessage();
  });

  function loadSettings() {
    apiKeyInput.value = getCookieValue('agent_apikey') || '';
    agentRole.value = getCookieValue('agent_role') || agentRole.placeholder;
    agentBot.value = getCookieValue('agent_bot') || 'chatGPT';
    updateBotSettings();
  }

  function saveApiKey() {
    setCookie('agent_apikey', apiKeyInput.value);
  }

  function saveAgentRole() {
    setCookie('agent_role', agentRole.value);
  }

  function updateBotSettings() {
    const agentBotValue = agentBot.value;

    let endPoint = '';
    let model = '';

    if (agentBotValue === "Llama") {
      endPoint = "http://localhost:1234/v1/chat/completions";
      model = "llama-model";
    } else if (agentBotValue === "chatGPT") {
      endPoint = DEFAULT_API_ENDPOINT;
      model = DEFAULT_MODEL;
    } else if (agentBotValue === "Custom") {
      endPoint = '';
      model = '';
    }

    setCookie('agent_bot', agentBotValue);
    botModel.value = model;
    botEndPoint.value = endPoint;
  }

  async function sendMessage() {
    const inputField = document.getElementById('user-input');
    const userMessage = inputField.value.trim();

    if (!userMessage) return;

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
    const apiKey = apiKeyInput.value || 'YOUR_API_KEY';
    const endpoint = botEndPoint.value;
    const model = botModel.value;

    const payload = {
      model: model,
      messages: [
        { role: "system", content: agentRole.value },
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
        return data.error ? `(${data.error.code}) ${data.error.message}` : 'Sorry, I am having trouble responding at the moment. Please try again later.';
      }
    } catch (error) {
      console.error('Error:', error);
      return 'Sorry, I am having trouble responding at the moment. Please try again later.';
    }
  }

  function getCookieValue(cookieName) {
    const name = cookieName + '=';
    const decodedCookie = decodeURIComponent(document.cookie);
    const cookieArray = decodedCookie.split(';');
    for (const cookie of cookieArray) {
      let c = cookie.trim();
      if (c.indexOf(name) === 0) return c.substring(name.length, c.length);
    }
    return '';
  }

  function setCookie(cookieName, cookieValue, days = 365) {
    const d = new Date();
    d.setTime(d.getTime() + (days * 24 * 60 * 60 * 1000));
    const expires = `expires=${d.toUTCString()}`;
    document.cookie = `${cookieName}=${encodeURIComponent(cookieValue)};${expires};path=/`;
  }
});
