export async function POST(request: Request) {
  const { messages } = await request.json();

  console.log('Incoming messages:', messages);

  try {
    const openAiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}` // 환경변수로 API 키 관리
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: messages,
        tools: [
          {
            type: "function",
            function: {
              name: "search_google_maps",
              description: "Search for places using Google Maps via SerpAPI",
              parameters: {
                type: "object",
                properties: {
                  query: { type: "string", description: "The place or business to search for" },
                  location: { type: "string", description: "The location to search in" }
                },
                required: ["query", "location"]
              }
            }
          }
        ],
        temperature: 0.7,
        max_tokens: 500
      })
    });

    if (!openAiResponse.ok) {
      throw new Error(`OpenAI API Error: ${openAiResponse.statusText}`);
    }

    const data = await openAiResponse.json();
    const responseMessage = data.choices[0].message;

    console.log('Response from OpenAI:', responseMessage);

    return new Response(JSON.stringify(responseMessage));
  } catch (error) {
    console.error('Error fetching OpenAI response:', error);
    return new Response(JSON.stringify({ error: error }), {
      status: 500
    });
  }
}