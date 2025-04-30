export const GA_TRACKING_ID = 'G-MLW4KEPN5F';
// --------------------------------------------------


export const pageview = (url) => {
  if (typeof window.gtag === 'function') {
    window.gtag('config', GA_TRACKING_ID, {
      page_path: url,
    });
  } else {
    console.warn('window.gtag is not available. GA script might not be loaded.');
  }
};


export const event = ({ action, category, label, value }) => {
  if (typeof window.gtag === 'function') {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }
};