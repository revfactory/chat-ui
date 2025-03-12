import { ChatCompletionMessageParam } from 'openai/resources/chat/completions';
import { SYSTEM_PROMPT } from './constants';
import useConversationStore from '@/stores/useConversationStore';

export interface MessageItem {
  type: 'message';
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface FunctionCallItem {
  type: 'function_call';
  name: string;
  arguments: any;
}

export type Item = MessageItem | FunctionCallItem;

export const handleTurn = async () => {
  const {
    chatMessages,
    conversationItems,
    setChatMessages,
    setConversationItems
  } = useConversationStore.getState();

  const allConversationItems: ChatCompletionMessageParam[] = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...conversationItems
  ];

  try {
    const response = await fetch('http://localhost:8080/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: allConversationItems })
    });

    if (!response.ok) {
      console.error(`Error: ${response.statusText}`);
      return;
    }
    const data: MessageItem | FunctionCallItem = await response.json();

    if ('name' in data && data.name === "search_google_maps") {
      await handleGoogleMapsSearch(data.arguments);
      return;
    }

    chatMessages.push(data);
    setChatMessages([...chatMessages]);
    conversationItems.push(data as MessageItem);
    setConversationItems([...conversationItems]);
  } catch (error) {
    console.error('Error processing messages:', error);
  }
};

export const handleGoogleMapsSearch = async ({ query, location }: { query: string; location: string }) => {
  try {
    const response = await fetch(`https://serpapi.com/search?engine=google_maps&q=${encodeURIComponent(query)}&location=${encodeURIComponent(location)}&api_key=${process.env.SERPAPI_KEY}`);
    const data = await response.json();
    console.log('Google Maps Search Result:', data);
    return data;
  } catch (error) {
    console.error('Error fetching Google Maps data:', error);
  }
};