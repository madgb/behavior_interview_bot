import { useState } from 'react';
import { getBehaviorAnswerStreamFromHistory } from './utils/gptClient';
import AnswerDisplay from './components/AnswerDisplay';

function App() {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [messageHistory, setMessageHistory] = useState<any[]>([]);
  const [isCutOff, setIsCutOff] = useState(false);

  const handleSend = async () => {
    const trimmed = question.trim().toLowerCase();

    // reset 명령어 처리
    if (trimmed === 'reset') {
      setMessageHistory([]);
      setAnswer('');
      setQuestion('');
      return;
    }

    setAnswer('');
    setLoading(true);

    const updatedHistory = [
      ...messageHistory,
      { role: 'user', content: question },
    ];
    setMessageHistory(updatedHistory);

    try {
      await getBehaviorAnswerStreamFromHistory(updatedHistory, (chunk) => {
        setAnswer((prev) => prev + chunk);
      }, () => {
        // 스트리밍 종료 시점
        // GPT 응답이 끝난 건지 잘린 건지 모르니, 일단 'Continue?' 버튼을 띄워보자
        setIsCutOff(true);
      });

      setMessageHistory((prev) => [
        ...prev,
        { role: 'assistant', content: answer }, // 응답 누적
      ]);
    } catch (e) {
      setAnswer('⚠️ Error during response...');
      console.error(e);
    } finally {
      setLoading(false);
      setQuestion('');
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
      <h1>🧠 Behavioral Answer Generator (Streaming + Follow-up)</h1>

      <textarea
        placeholder="Type your question or follow-up (e.g., 'next', 'elaborate', 'reset')"
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        rows={4}
        style={{ width: '100%', marginBottom: '1rem' }}
      />

      <button onClick={handleSend} disabled={loading}>
        {loading ? 'Generating...' : 'Send'}
      </button>

      <AnswerDisplay answer={answer} />
      {isCutOff && (
        <div style={{ marginTop: '1rem' }}>
          <button
            onClick={() => {
              setQuestion('continue');
              setIsCutOff(false);
              handleSend();
            }}
          >
            👉 Continue?
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
