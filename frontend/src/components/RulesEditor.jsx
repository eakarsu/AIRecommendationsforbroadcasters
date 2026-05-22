import React, { useEffect, useState } from 'react';

// NON-VIZ: Recommendation Rules Editor (CRUD weights, A/B groups)
export default function RulesEditor() {
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({ name: '', segment: 'casual', contentType: 'series', weight: 1.0, abGroup: 'A', active: true });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => { load(); }, []);

  function authHeaders() {
    const token = localStorage.getItem('token') || '';
    return { 'Content-Type': 'application/json', ...(token ? { Authorization: 'Bearer ' + token } : {}) };
  }

  async function load() {
    setLoading(true); setError(null);
    try {
      const res = await fetch('/api/custom-views/rules', { headers: authHeaders() });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || 'Failed');
      setRules(j.rules || []);
    } catch (e) { setError(e.message); }
    setLoading(false);
  }

  async function save() {
    setError(null);
    try {
      const url = editingId ? '/api/custom-views/rules/' + editingId : '/api/custom-views/rules';
      const method = editingId ? 'PUT' : 'POST';
      const res = await fetch(url, { method, headers: authHeaders(), body: JSON.stringify({ ...form, weight: parseFloat(form.weight) || 0 }) });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || 'Save failed');
      setForm({ name: '', segment: 'casual', contentType: 'series', weight: 1.0, abGroup: 'A', active: true });
      setEditingId(null);
      load();
    } catch (e) { setError(e.message); }
  }

  async function remove(id) {
    setError(null);
    try {
      const res = await fetch('/api/custom-views/rules/' + id, { method: 'DELETE', headers: authHeaders() });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || 'Delete failed');
      load();
    } catch (e) { setError(e.message); }
  }

  function edit(r) {
    setEditingId(r.id);
    setForm({ name: r.name, segment: r.segment, contentType: r.contentType, weight: r.weight, abGroup: r.abGroup, active: r.active });
  }

  function cancel() {
    setEditingId(null);
    setForm({ name: '', segment: 'casual', contentType: 'series', weight: 1.0, abGroup: 'A', active: true });
  }

  return (
    <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, padding: 16 }}>
      <h3 style={{ margin: '0 0 4px', fontSize: 16 }}>Recommendation Rules</h3>
      <p style={{ margin: '0 0 12px', color: '#666', fontSize: 12 }}>Manage weights and A/B test groups for the recommendation engine.</p>

      {error && <div style={{ padding: 8, background: '#fee', color: '#900', borderRadius: 4, marginBottom: 8, fontSize: 12 }}>{error}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 0.6fr 0.6fr 0.6fr', gap: 8, marginBottom: 12, alignItems: 'end' }}>
        <div>
          <label style={{ display: 'block', fontSize: 11, color: '#555' }}>Rule name</label>
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="e.g. Sports Boost" style={{ width: '100%', padding: 6, border: '1px solid #ddd', borderRadius: 4 }} />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 11, color: '#555' }}>Segment</label>
          <input value={form.segment} onChange={(e) => setForm({ ...form, segment: e.target.value })}
            style={{ width: '100%', padding: 6, border: '1px solid #ddd', borderRadius: 4 }} />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 11, color: '#555' }}>Content type</label>
          <input value={form.contentType} onChange={(e) => setForm({ ...form, contentType: e.target.value })}
            style={{ width: '100%', padding: 6, border: '1px solid #ddd', borderRadius: 4 }} />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 11, color: '#555' }}>Weight</label>
          <input type="number" step="0.1" value={form.weight} onChange={(e) => setForm({ ...form, weight: e.target.value })}
            style={{ width: '100%', padding: 6, border: '1px solid #ddd', borderRadius: 4 }} />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 11, color: '#555' }}>A/B</label>
          <select value={form.abGroup} onChange={(e) => setForm({ ...form, abGroup: e.target.value })}
            style={{ width: '100%', padding: 6, border: '1px solid #ddd', borderRadius: 4 }}>
            <option value="A">A</option>
            <option value="B">B</option>
          </select>
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          <button onClick={save}
            style={{ flex: 1, padding: '6px 8px', background: '#111', color: '#fff', border: 0, borderRadius: 4, cursor: 'pointer', fontSize: 12 }}>
            {editingId ? 'Update' : 'Add'}
          </button>
          {editingId && (
            <button onClick={cancel}
              style={{ padding: '6px 8px', background: '#fff', color: '#111', border: '1px solid #ddd', borderRadius: 4, cursor: 'pointer', fontSize: 12 }}>
              Cancel
            </button>
          )}
        </div>
      </div>

      {loading ? <div style={{ color: '#666' }}>Loading rules...</div> : (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: '#f7f7f7' }}>
              <th style={{ textAlign: 'left', padding: 8, borderBottom: '1px solid #eee' }}>Name</th>
              <th style={{ textAlign: 'left', padding: 8, borderBottom: '1px solid #eee' }}>Segment</th>
              <th style={{ textAlign: 'left', padding: 8, borderBottom: '1px solid #eee' }}>Content</th>
              <th style={{ textAlign: 'right', padding: 8, borderBottom: '1px solid #eee' }}>Weight</th>
              <th style={{ textAlign: 'center', padding: 8, borderBottom: '1px solid #eee' }}>A/B</th>
              <th style={{ textAlign: 'center', padding: 8, borderBottom: '1px solid #eee' }}>Active</th>
              <th style={{ textAlign: 'right', padding: 8, borderBottom: '1px solid #eee' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rules.map((r) => (
              <tr key={r.id}>
                <td style={{ padding: 8, borderBottom: '1px solid #f1f1f1' }}>{r.name}</td>
                <td style={{ padding: 8, borderBottom: '1px solid #f1f1f1' }}>{r.segment}</td>
                <td style={{ padding: 8, borderBottom: '1px solid #f1f1f1' }}>{r.contentType}</td>
                <td style={{ padding: 8, borderBottom: '1px solid #f1f1f1', textAlign: 'right' }}>{r.weight}</td>
                <td style={{ padding: 8, borderBottom: '1px solid #f1f1f1', textAlign: 'center' }}>
                  <span style={{ background: r.abGroup === 'A' ? '#dbeafe' : '#fde68a', padding: '2px 8px', borderRadius: 10, fontSize: 11 }}>{r.abGroup}</span>
                </td>
                <td style={{ padding: 8, borderBottom: '1px solid #f1f1f1', textAlign: 'center' }}>{r.active ? 'Yes' : 'No'}</td>
                <td style={{ padding: 8, borderBottom: '1px solid #f1f1f1', textAlign: 'right' }}>
                  <button onClick={() => edit(r)} style={{ marginRight: 6, padding: '4px 8px', background: '#fff', border: '1px solid #ddd', borderRadius: 4, cursor: 'pointer', fontSize: 11 }}>Edit</button>
                  <button onClick={() => remove(r.id)} style={{ padding: '4px 8px', background: '#fee', border: '1px solid #fca5a5', color: '#900', borderRadius: 4, cursor: 'pointer', fontSize: 11 }}>Delete</button>
                </td>
              </tr>
            ))}
            {rules.length === 0 && (
              <tr><td colSpan={7} style={{ padding: 16, textAlign: 'center', color: '#999' }}>No rules. Add one above.</td></tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}
