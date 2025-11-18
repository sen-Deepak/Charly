// api.config.js
// This file resolves the backend (n8n) base URL in a way that works for
// local development (localhost) and when accessing the Vite dev server
// remotely (e.g. via 172.17.0.95:5173). If VITE_N8N_BASE_URL is provided
// it will be used unchanged. Otherwise we attempt to build a runtime URL
// that points to the same host serving the frontend on a configurable port.

const DEFAULT_N8N_PORT = import.meta.env.VITE_N8N_PORT || '5678';

function resolveN8nBaseUrl() {
    // If the developer explicitly provided a base URL, use it.
    const envUrl = import.meta.env.VITE_N8N_BASE_URL;
    if (envUrl && envUrl !== '') return envUrl;

    // When running in a browser (dev server accessed remotely), construct
    // a base URL using the current window hostname so requests go to the
    // same host that served the frontend (instead of the client's localhost).
    if (typeof window !== 'undefined' && window.location) {
        const protocol = window.location.protocol || 'http:';
        const hostname = window.location.hostname;
        return `${protocol}//${hostname}:${DEFAULT_N8N_PORT}`;
    }

    // Fallback for non-browser environments
    return `http://localhost:${DEFAULT_N8N_PORT}`;
}

const API_CONFIG = {
    N8N_BASE_URL: resolveN8nBaseUrl(),
    HR_DONNA_WEBHOOK: '/webhook/hrdonna',
    TIMEOUT_MS: 30000, // 30 seconds timeout
};

// Construct full webhook URL
API_CONFIG.HR_DONNA_FULL_URL = `${API_CONFIG.N8N_BASE_URL}${API_CONFIG.HR_DONNA_WEBHOOK}`;

export default API_CONFIG;