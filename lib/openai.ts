// openai.ts
import fetch from 'node-fetch';

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

export async function openaiCall(query: any) {

  let model = 'gpt-4'
  // let model = 'gpt-3.5-turbo'
  
  let tokens

  if (model === 'gpt-3.5-turbo') {
    tokens = 3000
  } else {
    tokens = 8000
  }
  const response = await fetch(OPENAI_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      messages: [{ "role": "user", "content": query.prompt }],
      model: model,
      temperature: 0.7,
      max_tokens: tokens,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0
    })
  });

  const data = await response.json();
  return data;
}