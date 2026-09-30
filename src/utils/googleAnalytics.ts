/**
 * AURUM TERMINAL — GOOGLE ANALYTICS (GA4) EVENT TRACKER
 */

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

export function trackPageView(pagePath: string, pageTitle: string): void {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'page_view', {
      page_path: pagePath,
      page_title: pageTitle
    });
  }
}

export function trackGaEvent(eventName: string, params: { [key: string]: any } = {}): void {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, {
      ...params,
      timestamp: Date.now()
    });
  }
}
