import React from 'react';
import JsonReport from './JsonReport';

export default function AIOutput({ data, loading }) {
  if (loading) {
    return (
      <div className="ai-output">
        <div className="ai-output-header">
          <span className="material-icons-round">auto_awesome</span>
          <h3>AI Processing...</h3>
        </div>
        <div className="loading">
          <div className="spinner"></div>
          <span>Analyzing with AI model...</span>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <JsonReport
      data={data}
      title={typeof data === 'object' && data && data.title ? data.title : 'AI Analysis Results'}
    />
  );
}
