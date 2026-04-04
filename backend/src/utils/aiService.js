const OpenAI = require('openai');
require('dotenv').config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function generateSupportResponse(userMessage) {
  const prompt = `You are a helpful customer support agent. Respond to: ${userMessage}`;
  const response = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 150,
  });
  return response.choices[0].message.content.trim();
}

module.exports = { generateSupportResponse };