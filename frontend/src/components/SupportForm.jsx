import React, { useState } from 'react';
import api from '../api/axiosInstance';

const SupportChat = () => {
  const [message, setMessage] = useState('');
  const [chat, setChat] = useState([]);

  const sendMessage = async () => {
    if (!message) return;
    const userMessage = { text: message, sender: 'user' };
    setChat((prev) => [...prev, userMessage]);

    try {
      const response = await api.post('/api/support/chat', { message });
      setChat((prev) => [...prev, { text: response.data.reply, sender: 'ai' }]);
    } catch (error) {
      setChat((prev) => [...prev, { text: 'Error: Could not get response.', sender: 'ai' }]);
    }
    setMessage('');
  };

  return (
    <div style={{ padding: '10px', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <h3 style={{ margin: '0 0 10px 0' }}>AI Support Chat</h3>
      <div style={{ flex: 1, overflowY: 'auto', border: '1px solid #ccc', padding: '5px', marginBottom: '10px' }}>
        {chat.map((msg, idx) => (
          <p key={idx} style={{ margin: '5px 0' }}><strong>{msg.sender}:</strong> {msg.text}</p>
        ))}
      </div>
      <div style={{ display: 'flex' }}>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Ask a question..."
          style={{ flex: 1, marginRight: '5px' }}
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
};

export default SupportChat;