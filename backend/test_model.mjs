const apiKey = process.env.GEMINI_API_KEY || '';

const testModels = [
  'gemini-2.5-flash-lite',
  'gemini-3.1-flash-lite',
  'gemini-3.5-flash',
  'gemini-3.5-flash-lite',
  'gemini-3.6-flash',
  'gemini-3.7-flash',
  'gemini-3.8-flash',
  'gemini-pro-latest',
  'gemma-4-31b-it',
  'gemma-4-26b-a4b-it'
];

async function findWorkingModel() {
  for (const model of testModels) {
    try {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: 'Respond with: OK' }] }]
        })
      });
      const data = await res.json();
      if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
        console.log(`FOUND WORKING MODEL: ${model} -> ${data.candidates[0].content.parts[0].text.trim()}`);
        return model;
      } else {
        const msg = data.error?.message || data.candidates?.[0]?.finishReason || 'Unknown response';
        console.log(`Model ${model}: ${msg}`);
      }
    } catch (e) {
      console.log(`Error ${model}: ${e.message}`);
    }
  }
}

findWorkingModel();
