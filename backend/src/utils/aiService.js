require('dotenv').config();

// Supports Anthropic (preferred) and falls back to OpenAI when Anthropic is not configured
// - Set `ANTHROPIC_API_KEY` to use Anthropic (/v1/messages)
// - Otherwise set `OPENAI_API_KEY` to use OpenAI's Chat Completions

const OpenAI = require('openai');

async function generateSupportResponse(userMessage) {
  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;

  // Build a simple prompt/message content
  const systemPrompt = 'You are a helpful customer support agent.';
  const userContent = `Respond to the user message: ${userMessage}`;

  // Try Anthropic first when key is present
  if (anthropicKey) {
    try {
      const model = process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-6';
      const payload = {
        model,
        max_tokens: 300,
        messages: [{ role: 'user', content: `${systemPrompt} ${userContent}` }]
      };

      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': anthropicKey,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const text = await res.text();
        // If Anthropic auth fails and OpenAI key exists, fall back below
        if (res.status === 401 && openaiKey) {
          console.warn('Anthropic authentication failed, falling back to OpenAI');
        } else {
          throw new Error(`Anthropic API error: ${res.status} ${text}`);
        }
      } else {
        const data = await res.json();
        const reply = data.completion || data.message?.content || data.completion?.[0] || JSON.stringify(data);
        return (typeof reply === 'string') ? reply.trim() : JSON.stringify(reply);
      }
    } catch (err) {
      // If a network or other error occurred and OpenAI is available, fall back
      if (openaiKey) {
        console.warn('Anthropic request failed, falling back to OpenAI:', err.message);
      } else {
        throw err;
      }
    }
  }

  // Fallback: OpenAI if configured
  if (openaiKey) {
    const client = new OpenAI({ apiKey: openaiKey });
    const model = process.env.OPENAI_MODEL || 'gpt-3.5-turbo';

    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userContent }
    ];

    const resp = await client.chat.completions.create({ model, messages, max_tokens: 300 });
    // Newer SDKs return choices with message.content, older formats vary — be defensive
    const choice = resp?.choices?.[0];
    const text = choice?.message?.content || choice?.text || JSON.stringify(resp);
    return (typeof text === 'string') ? text.trim() : JSON.stringify(text);
  }

  throw new Error('No AI provider configured. Set ANTHROPIC_API_KEY or OPENAI_API_KEY in your .env');
}

module.exports = { generateSupportResponse };