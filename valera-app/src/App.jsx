import { useState } from 'react'
import './App.css'

const NEEDS = [
  'Health Insurance',
  'Food Assistance',
  'Housing',
  'Transportation',
  'Mental Health',
  'Substance Use Treatment',
  'Employment',
  'Cash Aid',
  'Legal Help',
  'Other',
]

function App() {
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({
    clientRef: '',
    needs: [],
    notes: '',
  })

  const toggleNeed = (need) => {
    setForm((prev) => ({
      ...prev,
      needs: prev.needs.includes(need)
        ? prev.needs.filter((n) => n !== need)
        : [...prev.needs, need],
    }))
  }

  const handleSubmit = () => {
    console.log('Session started:', form)
    setStep(3)
  }

  return (
    <div className="kat-wrap">
      <header className="kat-header">
        <img src="/valera-roots-logo-inline.png" alt="Valera Roots" className="kat-logo" />
        <span className="kat-badge">kat</span>
      </header>

      {step === 1 && (
        <div className="kat-card">
          <h1>Let's get started.</h1>
          <p>Enter a client reference number to begin.</p>
          <input
            className="kat-input"
            type="text"
            placeholder="Client reference (e.g. IBH-2026-001)"
            value={form.clientRef}
            onChange={(e) => setForm({ ...form, clientRef: e.target.value })}
          />
          <button
            className="kat-btn"
            disabled={!form.clientRef}
            onClick={() => setStep(2)}
          >
            Continue
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="kat-card">
          <h1>What does this client need help with?</h1>
          <p>Select all that apply.</p>
          <div className="kat-needs">
            {NEEDS.map((need) => (
              <button
                key={need}
                className={`kat-need ${form.needs.includes(need) ? 'selected' : ''}`}
                onClick={() => toggleNeed(need)}
              >
                {need}
              </button>
            ))}
          </div>
          <textarea
            className="kat-input"
            placeholder="Any additional context? (optional)"
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            rows={3}
          />
          <button
            className="kat-btn"
            disabled={form.needs.length === 0}
            onClick={handleSubmit}
          >
            Find Resources
          </button>
        </div>
      )}

      {step === 3 && (
        <div className="kat-card">
          <h1>Got it.</h1>
          <p>Kat is finding the best resources for this client.</p>
          <p className="kat-ref">Client: {form.clientRef}</p>
          <p className="kat-ref">Needs: {form.needs.join(', ')}</p>
          <div className="kat-loading">Working on it...</div>
        </div>
      )}
    </div>
  )
}

export default App