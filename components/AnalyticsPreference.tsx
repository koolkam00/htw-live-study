'use client';

import { useEffect, useState } from 'react';
import { analyticsConfigured, analyticsDisabled, browserRejectsAnalytics, setAnalyticsDisabled } from '@/lib/analytics';
import { ANALYTICS_CHANGED } from '@/lib/analytics-policy';

export default function AnalyticsPreference() {
  const [state, setState] = useState<{ configured: boolean; disabled: boolean; browser: boolean } | null>(null);
  useEffect(() => {
    const refresh = () => setState({ configured: analyticsConfigured(), disabled: analyticsDisabled(), browser: browserRejectsAnalytics() });
    refresh(); window.addEventListener(ANALYTICS_CHANGED, refresh); window.addEventListener('storage', refresh);
    return () => { window.removeEventListener(ANALYTICS_CHANGED, refresh); window.removeEventListener('storage', refresh); };
  }, []);
  if (!state) return <p>Loading your analytics preference…</p>;
  if (!state.configured) return <p>Analytics is not enabled in this environment.</p>;
  if (state.browser) return <p>Analytics is off because your browser sends a Do Not Track or Global Privacy Control preference.</p>;
  return <div><p role="status">Analytics is {state.disabled ? 'off' : 'on'} for this browser.</p><button className="button-secondary" type="button" onClick={() => setAnalyticsDisabled(!state.disabled)}>{state.disabled ? 'Allow anonymous analytics' : 'Turn off analytics'}</button><p className="control-help">This choice applies to this browser. Clearing site storage resets your saved choice.</p></div>;
}
