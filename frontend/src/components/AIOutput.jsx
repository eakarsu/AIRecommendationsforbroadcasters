import React from 'react';

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

  const getConfidenceClass = (val) => {
    if (val >= 80) return 'high';
    if (val >= 50) return 'medium';
    return 'low';
  };

  const getTrendIcon = (trend) => {
    if (trend === 'up' || (typeof trend === 'string' && trend.startsWith('+'))) return { icon: 'trending_up', cls: 'ai-trend-up' };
    if (trend === 'down' || (typeof trend === 'string' && trend.startsWith('-'))) return { icon: 'trending_down', cls: 'ai-trend-down' };
    return { icon: 'trending_flat', cls: 'ai-trend-stable' };
  };

  const renderItemValue = (item) => {
    // Handle various item formats from the AI
    const name = item.name || item.metric || item.action || item.slot || item.point || '';
    const detail = item.reason || item.detail || item.description || item.prediction || item.impact || '';
    const value = item.confidence || item.relevance || item.value || item.growth || item.lift || '';
    const trend = item.trend || item.growth || '';

    const trendInfo = getTrendIcon(trend);
    const numericVal = typeof value === 'number' ? value : parseInt(value);

    return (
      <div className="ai-item" key={name + detail}>
        <div
          className="ai-item-icon"
          style={{ background: 'var(--accent-glow)' }}
        >
          {typeof trend === 'string' && trend ? (
            <span className={`material-icons-round ${trendInfo.cls}`}>{trendInfo.icon}</span>
          ) : (
            <span className="material-icons-round" style={{ color: 'var(--accent-hover)', fontSize: 18 }}>insights</span>
          )}
        </div>
        <div className="ai-item-content">
          <div className="ai-item-name">{name}</div>
          {detail && <div className="ai-item-detail">{detail}</div>}
        </div>
        <div className="ai-item-meta">
          {!isNaN(numericVal) && numericVal > 0 && (
            <span className={`ai-confidence ${getConfidenceClass(numericVal)}`}>
              {typeof value === 'string' && !value.match(/^\d+$/) ? value : `${numericVal}%`}
            </span>
          )}
          {typeof value === 'string' && isNaN(numericVal) && value && (
            <span className="ai-confidence medium">{value}</span>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="ai-output">
      <div className="ai-output-header">
        <span className="material-icons-round">auto_awesome</span>
        <h3>{data.title || 'AI Analysis Results'}</h3>
        <span className="ai-model-tag">Powered by Claude AI</span>
      </div>

      {data.sections?.map((section, idx) => (
        <div className="ai-section" key={idx}>
          <h4>{section.heading}</h4>
          {section.items?.map((item, i) => (
            <React.Fragment key={i}>{renderItemValue(item)}</React.Fragment>
          ))}
        </div>
      ))}

      {data.summary && (
        <div className="ai-summary">
          <strong>Summary: </strong>{data.summary}
        </div>
      )}
    </div>
  );
}
