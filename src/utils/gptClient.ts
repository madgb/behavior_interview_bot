import { OpenAI } from 'openai';

const openai = new OpenAI({
    apiKey: import.meta.env.VITE_OPENAI_API_KEY,
    dangerouslyAllowBrowser: true, // 클라이언트에서 직접 호출
});

export async function getBehaviorAnswerStream(
    prompt: string,
    onChunk: (text: string) => void,
): Promise<void> {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
            model: 'gpt-3.5-turbo',
            messages: [
                {
                    role: 'system',
                    content: `
  You are an expert behavioral interview coach.
  Answer all questions using the STAR format (Situation, Task, Action, Result).
  If the user types "next" or "elaborate", continue with more details.
  Keep answers structured and professional.
            `.trim(),
                },
                {
                    role: 'user',
                    content: prompt,
                },
            ],
            temperature: 0.7,
            stream: true,
        }),
    });

    if (!response.ok || !response.body) {
        throw new Error('Stream response error');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let partial = '';

    while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        partial += chunk;

        const lines = partial.split('\n');
        partial = lines.pop() || '';

        for (const line of lines) {
            if (line.startsWith('data: ')) {
                const json = line.replace('data: ', '');
                if (json === '[DONE]') return;
                try {
                    const parsed = JSON.parse(json);
                    const content = parsed.choices[0]?.delta?.content;
                    if (content) onChunk(content);
                } catch (err) {
                    console.error('JSON parse error:', err);
                }
            }
        }
    }
}

let abortController: AbortController | null = null;

export async function getBehaviorAnswerStreamFromHistory(
    messages: any[],
    onChunk: (text: string) => void,
    onDone?: () => void,
): Promise<void> {
    if (abortController) {
        abortController.abort(); // 이전 요청 취소
    }

    abortController = new AbortController();

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        signal: abortController.signal,
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
            model: 'gpt-3.5-turbo',
            messages: [
                {
                    role: 'system',
                    content: `
You are an expert behavioral interview coach.
Always use STAR format (Situation, Task, Action, Result).
Continue the conversation naturally. Respond concisely to follow-ups like "next", "elaborate", or "shorter".
Only reset if the user types "reset".
          `.trim(),
                },
                ...messages,
            ],
            stream: true,
        }),
    });

    if (!response.ok || !response.body) throw new Error('Stream error');

    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let partial = '';

    while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        partial += chunk;

        const lines = partial.split('\n');
        partial = lines.pop() || '';

        for (const line of lines) {
            if (line.startsWith('data: ')) {
                const json = line.replace('data: ', '');
                if (json === '[DONE]') {
                    if (onDone) onDone();
                    return;
                }
                try {
                    const parsed = JSON.parse(json);
                    const content = parsed.choices[0]?.delta?.content;
                    if (content) onChunk(content);
                } catch (e) {
                    console.error('parse error', e);
                }
            }
        }
    }
}

export async function getBehaviorAnswer(prompt: string): Promise<string> {
    const res = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        stream: false,
        messages: [
            {
                role: 'system',
                content: `
You are an expert behavioral interview coach.
Answer all questions using the STAR format (Situation, Task, Action, Result).
Be concise and structured. If the user types "next" or "elaborate", continue with more details.
        `.trim(),
            },
            {
                role: 'user',
                content: prompt,
            },
        ],
    });

    return res.choices[0]?.message?.content || '';
}
