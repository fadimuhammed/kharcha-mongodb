import { useState } from 'react';
import api from '../utils/api';

const SUGGESTIONS = [
  'Where am I spending the most?',
  'How can I reduce my monthly expenses?',
  'Am I spending too much on food?',
  'Give me a savings tip based on my data.',
  'Which category should I cut back on?',
];

export default function AiPage() {
  const [question, setQuestion] = useState('');
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');
  const [history,  setHistory]  = useState([]);

  const ask = async (q) => {
    const text = (q || question).trim();
    if (!text || loading) return;
    setLoading(true);
    setError('');
    setQuestion('');

    try {
      const { data } = await api.post('/ai/ask', { question: text });
      setHistory(h => [{ q: text, a: data.reply, ts: new Date() }, ...h]);
    } catch (e) {
      setError(e.response?.data?.error || 'Could not reach AI. Check your ANTHROPIC_API_KEY.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth:700, margin:'0 auto' }}>

      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:20 }}>
        <div style={{ width:42, height:42, borderRadius:11, background:'var(--purple)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
        </div>
        <div>
          <h1 style={{ fontSize:18, fontWeight:700 }}>AI Finance Advisor</h1>
          <p style={{ fontSize:13, color:'var(--text-2)' }}>Powered by Claude — reads your real MongoDB expense data</p>
        </div>
      </div>

      {/* Suggestion chips */}
      <div style={{ display:'flex', flexWrap:'wrap', gap:6, marginBottom:16 }}>
        {SUGGESTIONS.map(s => (
          <button key={s} type="button" onClick={() => ask(s)} disabled={loading}
            style={{ fontSize:12, padding:'5px 13px', color:'var(--text-2)', borderRadius:20, background:'#f3f4f6', border:'1px solid var(--border)' }}>
            {s}
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="card" style={{ marginBottom:16 }}>
        <div style={{ display:'flex', gap:8 }}>
          <input
            value={question}
            onChange={e => setQuestion(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && ask()}
            placeholder="Ask anything about your spending…"
            disabled={loading}
          />
          <button className="btn-primary" onClick={() => ask()} disabled={loading || !question.trim()} style={{ whiteSpace:'nowrap', flexShrink:0, minWidth:64 }}>
            {loading ? '…' : 'Ask'}
          </button>
        </div>
      </div>

      {/* Loading pulse */}
      {loading && (
        <div style={{ display:'flex', alignItems:'center', gap:8, color:'var(--text-2)', fontSize:13, marginBottom:14 }}>
          <span style={{ display:'inline-flex', gap:3 }}>
            {[0,1,2].map(i => (
              <span key={i} style={{ width:6, height:6, borderRadius:'50%', background:'var(--purple)', display:'inline-block', animation:`bounce 1s ${i*0.15}s infinite` }} />
            ))}
          </span>
          Analysing your expense data…
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="card" style={{ borderLeft:'3px solid var(--red)', marginBottom:14, color:'var(--red)', fontSize:13 }}>
          {error}
        </div>
      )}

      {/* Conversation history */}
      {history.length > 0 && history.map((item, i) => (
        <div key={i} style={{ marginBottom:14, opacity: i === 0 ? 1 : 0.75 }}>
          {/* Question bubble */}
          <div style={{ display:'flex', justifyContent:'flex-end', marginBottom:8 }}>
            <div style={{ background:'var(--teal-pale)', border:'1px solid #9FE1CB', borderRadius:'12px 12px 4px 12px', padding:'8px 14px', maxWidth:'80%', fontSize:13, color:'var(--teal-dark)', fontWeight:500 }}>
              {item.q}
            </div>
          </div>
          {/* Answer bubble */}
          <div style={{ display:'flex', gap:10, alignItems:'flex-start' }}>
            <div style={{ width:28, height:28, borderRadius:8, background:'var(--purple)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, marginTop:2 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
            </div>
            <div className="card" style={{ flex:1, fontSize:14, lineHeight:1.7, borderLeft:'3px solid var(--purple)', padding:'10px 14px' }}>
              {item.a}
            </div>
          </div>
        </div>
      ))}

      {history.length === 0 && !loading && !error && (
        <div style={{ textAlign:'center', padding:'3rem 1rem', color:'var(--text-3)' }}>
          <p style={{ fontSize:13 }}>Ask a question or tap a suggestion above to get started.</p>
        </div>
      )}

      <style>{`
        @keyframes bounce {
          0%,80%,100% { transform:translateY(0); opacity:.4 }
          40%          { transform:translateY(-5px); opacity:1 }
        }
      `}</style>
    </div>
  );
}
