import { useState } from 'react'
import { supabase } from './supabase'
import './App.css'

const NEEDS = ['Health Insurance','Food Assistance','Housing','Transportation','Mental Health','Substance Use Treatment','Employment','Cash Aid','Legal Help','Other']

const CATS = {'Health Insurance':'Health','Food Assistance':'Food','Housing':'Housing','Transportation':'Transportation','Mental Health':'Mental Health','Substance Use Treatment':'Recovery','Employment':'Employment','Cash Aid':'Financial','Legal Help':'Legal','Other':null}

function App() {
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({ clientRef: '', needs: [], notes: '' })
  const [resources, setResources] = useState([])
  const [loading, setLoading] = useState(false)
  const [katSummary, setKatSummary] = useState('')

  const toggleNeed = (need) => {
    setForm((prev) => ({ ...prev, needs: prev.needs.includes(need) ? prev.needs.filter((n) => n !== need) : [...prev.needs, need] }))
  }

  const handleSubmit = async () => {
    setLoading(true); setStep(3); setKatSummary('')
    const categories = form.needs.map((n) => CATS[n]).filter(Boolean)
    const { data, error } = await supabase.from('resources').select('*').in('category', categories).eq('is_active', true)
    if (error) { console.error(error); setLoading(false); return }
    setResources(data)
    if (data.length > 0) {
      try {
        const res = await fetch('/api/kat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ needs: form.needs, notes: form.notes, resources: data })
        })
        const json = await res.json()
        setKatSummary(json.summary)
      } catch (e) { console.error(e) }
    }
    setLoading(false)
  }

  const resetSession = () => { setStep(1); setForm({ clientRef: '', needs: [], notes: '' }); setResources([]); setKatSummary('') }

  return (
    <div className="kat-wrap">
      <header className="kat-header">
        <div className="kat-brand">
          <img src="/valera-roots-logo-inline-png.png" alt="Valera Roots" className="kat-logo" />
          <div className="kat-badge-wrap">
            <span className="kat-badge">KAT</span>
            <span className="kat-badge-sub">AI Navigator</span>
          </div>
        </div>
      </header>
      {step === 1 && (
        <div className="kat-card">
          <h1>Let's get started.</h1>
          <p>Enter a client reference number to begin.</p>
          <input className="kat-input" type="text" placeholder="Client reference (e.g. IBH-2026-001)" value={form.clientRef} onChange={(e) => setForm({ ...form, clientRef: e.target.value })} />
          <button className="kat-btn" disabled={!form.clientRef} onClick={() => setStep(2)}>Continue</button>
        </div>
      )}
      {step === 2 && (
        <div className="kat-card">
          <h1>What does this client need help with?</h1>
          <p>Select all that apply.</p>
          <div className="kat-needs">
            {NEEDS.map((need) => (
              <button key={need} className={'kat-need ' + (form.needs.includes(need) ? 'selected' : '')} onClick={() => toggleNeed(need)}>{need}</button>
            ))}
          </div>
          <textarea className="kat-input" placeholder="Any additional context? (optional)" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={3} />
          <button className="kat-btn" disabled={form.needs.length === 0} onClick={handleSubmit}>Find Resources</button>
        </div>
      )}
      {step === 3 && (
        <div className="kat-card">
          <h1>Got it.</h1>
          <p className="kat-ref">Client: {form.clientRef}</p>
          <p className="kat-ref">Needs: {form.needs.join(', ')}</p>
          {loading && <div className="kat-loading">KAT is thinking...</div>}
          {!loading && katSummary && (
            <div className="kat-synthesis">
              <div className="kat-synthesis-label">KAT's assessment</div>
              {katSummary.split('\n\n').map((para, i) => (
  <p key={i}>{para}</p>
))}
            </div>
          )}
          {!loading && resources.length === 0 && <p className="kat-ref">No matching resources found.</p>}
          {!loading && resources.length > 0 && (
            <div className="kat-results">
              <h2>{resources.length} resource{resources.length !== 1 ? 's' : ''} found</h2>
              {resources.map((r) => (
                <div key={r.id} className="kat-resource">
                  <h3>{r.name}</h3>
                  <p>{r.description}</p>
                  {r.eligibility_notes && <p className="kat-eligibility"><strong>Who qualifies:</strong> {r.eligibility_notes}</p>}
                  {r.how_to_apply && <p className="kat-how"><strong>How to apply:</strong> {r.how_to_apply}</p>}
                  <div className="kat-resource-footer">
                    {r.phone && <span>📞 {r.phone}</span>}
                    {r.url && <a href={r.url} target="_blank" rel="noreferrer">Learn more →</a>}
                  </div>
                </div>
              ))}
            </div>
          )}
          <button className="kat-btn" onClick={resetSession}>Start New Session</button>
        </div>
      )}
    </div>
  )
}

export default App