import React from 'react';
import EngagementChart from '../components/EngagementChart';
import HitRateHeatmap from '../components/HitRateHeatmap';
import ProgrammingBriefPDF from '../components/ProgrammingBriefPDF';
import RulesEditor from '../components/RulesEditor';

export default function CustomViewsPage() {
  return (
    <div style={{ padding: 24, maxWidth: 1280, margin: '0 auto', fontFamily: 'system-ui, sans-serif' }}>
      <header style={{ marginBottom: 20 }}>
        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700 }}>Broadcast Views</h1>
        <p style={{ margin: '4px 0 0', color: '#666' }}>
          Custom analytical views and tooling for the BroadcastAI recommendation engine.
        </p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        <EngagementChart />
        <HitRateHeatmap />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 16 }}>
        <ProgrammingBriefPDF />
        <RulesEditor />
      </div>
    </div>
  );
}
