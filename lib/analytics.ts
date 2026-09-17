import type { PostHog } from 'posthog-js';
import { ANALYTICS_CHANGED, ANALYTICS_HOSTS, ANALYTICS_PREFERENCE, analyticsPath, sanitizeAnalyticsEvent, type AnalyticsEvents } from './analytics-policy';

let loading: Promise<PostHog | null> | undefined;
let disabledForPage = false;
let lastPage: string | null = null;

export function browserRejectsAnalytics(): boolean {
  if (typeof navigator === 'undefined') return true;
  return navigator.doNotTrack === '1' || navigator.doNotTrack === 'yes' || (navigator as Navigator & { globalPrivacyControl?: boolean }).globalPrivacyControl === true;
}

export function analyticsDisabled(): boolean {
  if (browserRejectsAnalytics()) return true;
  try {
    const stored = window.localStorage.getItem(ANALYTICS_PREFERENCE);
    if (stored !== null) return stored === 'true';
  } catch {}
  return disabledForPage;
}

export function analyticsConfigured(): boolean {
  return typeof window !== 'undefined' && process.env.NODE_ENV === 'production' && ANALYTICS_HOSTS.has(window.location.hostname)
    && !!process.env.NEXT_PUBLIC_POSTHOG_KEY && ['https://us.i.posthog.com', 'https://eu.i.posthog.com'].includes(process.env.NEXT_PUBLIC_POSTHOG_HOST || '');
}

export function setAnalyticsDisabled(disabled: boolean): void {
  disabledForPage = disabled;
  try { window.localStorage.setItem(ANALYTICS_PREFERENCE, String(disabled)); } catch {}
  lastPage = null;
  window.dispatchEvent(new Event(ANALYTICS_CHANGED));
}

async function client(): Promise<PostHog | null> {
  if (!analyticsConfigured() || analyticsDisabled()) return null;
  if (!loading) {
    loading = import('posthog-js').then(({ default: posthog }) => {
      if (analyticsDisabled()) return null;
      posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
        api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
        defaults: '2026-05-30',
        cookieless_mode: 'always',
        person_profiles: 'never',
        persistence: 'memory',
        disable_persistence: true,
        autocapture: false,
        capture_pageview: false,
        capture_pageleave: false,
        capture_dead_clicks: false,
        capture_exceptions: false,
        capture_heatmaps: false,
        capture_performance: false,
        disable_session_recording: true,
        disable_surveys: true,
        disable_product_tours: true,
        disable_conversations: true,
        disable_web_experiments: true,
        disable_external_dependency_loading: true,
        advanced_disable_flags: true,
        advanced_disable_toolbar_metrics: true,
        save_referrer: false,
        save_campaign_params: false,
        respect_dnt: true,
        before_send: event => analyticsDisabled() ? null : sanitizeAnalyticsEvent(event),
      });
      return posthog;
    }).catch(() => null);
  }
  const result = await loading;
  if (!result) loading = undefined;
  return result;
}

async function send(event: keyof AnalyticsEvents | '$pageview', properties: Record<string, unknown>): Promise<void> {
  if (!analyticsConfigured() || analyticsDisabled()) return;
  const safeProperties = { ...properties, $current_url: 'https://splithappens.run' + analyticsPath(window.location.pathname), $referrer: document.referrer };
  try {
    const posthog = await client();
    if (posthog && !analyticsDisabled()) posthog.capture(event, safeProperties);
  } catch { /* Analytics must never interrupt a search, comparison or download. */ }
}

export function trackAnalytics<E extends keyof AnalyticsEvents>(event: E, properties: AnalyticsEvents[E]): void {
  void send(event, properties);
}

export function trackPage(pathname: string): void {
  if (!analyticsConfigured() || analyticsDisabled()) return;
  // Filters and unit changes update the URL but are not additional page views.
  if (pathname === lastPage) return;
  lastPage = pathname;
  void send('$pageview', {});
}
