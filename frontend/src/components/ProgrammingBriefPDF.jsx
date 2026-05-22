import React, { useState } from 'react';

// NON-VIZ: Programming Brief PDF download
export default function ProgrammingBriefPDF() {
  const [downloading, setDownloading] = useState(false);
  const [status, setStatus] = useState('');

  async function download() {
    setDownloading(true); setStatus('');
    try {
      const token = localStorage.getItem('token') || '';
      const res = await fetch('/api/custom-views/programming-brief', {
        headers: token ? { Authorization: 'Bearer ' + token } : {},
      });
      if (!res.ok) throw new Error('Download failed: ' + res.status);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'programming_brief.pdf';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setStatus('Downloaded programming_brief.pdf');
    } catch (e) {
      setStatus('Error: ' + e.message);
    }
    setDownloading(false);
  }

  return (
    <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, padding: 16 }}>
      <h3 style={{ margin: '0 0 4px', fontSize: 16 }}>Programming Brief</h3>
      <p style={{ margin: '0 0 12px', color: '#666', fontSize: 12 }}>
        Generate a PDF brief summarizing active recommendation rules, A/B groups, and programming priorities.
      </p>
      <button onClick={download} disabled={downloading}
        style={{ padding: '8px 14px', background: '#111', color: '#fff', border: 0, borderRadius: 6, cursor: 'pointer' }}>
        {downloading ? 'Generating...' : 'Download PDF'}
      </button>
      {status && <div style={{ marginTop: 10, fontSize: 12, color: status.startsWith('Error') ? '#900' : '#16a34a' }}>{status}</div>}
    </div>
  );
}
