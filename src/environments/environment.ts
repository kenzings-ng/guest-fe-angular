declare global {
  interface Window {
    __env?: {
      apiUrl?: string;
    };
  }
}

const apiUrl = window.__env?.apiUrl?.trim();

if (!apiUrl) {
  throw new Error('Missing API_URL runtime configuration. Set it in /env.js before starting the app.');
}

export const environment = {
  production: false,
  apiUrl,
  assetsBaseUrl: 'https://images.unsplash.com',
};
