// api.config.js
// This file resolves the backend (n8n) base URL in a way that works for
// local development (localhost) and when accessing the Vite dev server
// remotely (e.g. via 172.17.0.95:5173). If VITE_N8N_BASE_URL is provided
// it will be used unchanged. Otherwise we attempt to build a runtime URL
// that points to the same host serving the frontend on a configurable port.

const DEFAULT_N8N_BASE_URL =
    (import.meta.env && import.meta.env.VITE_N8N_BASE_URL) ||
    'https://n8n.srv1171882.hstgr.cloud';

function resolveN8nBaseUrl() {
    // Always use the explicit base URL (env or the production default),
    // and normalize away any trailing slashes.
    const envUrl = DEFAULT_N8N_BASE_URL;
    if (envUrl && envUrl !== '') return envUrl.replace(/\/+$/, '');

    // Previous localhost / dynamic-hostname resolution has been removed
    // in favor of a fixed, production-ready base URL.
    return DEFAULT_N8N_BASE_URL.replace(/\/+$/, '');
}

const API_CONFIG = {
    N8N_BASE_URL: resolveN8nBaseUrl(),
    // Webhook paths (these are appended to N8N_BASE_URL)
    //hr donna pinecone assistant- hrdonnaAssistant
    // hr donna assistant-hrdonna
    // hr donna v2-hrdonnav2
    //memer agent faster-MemerAgentfaster
    HR_DONNA_WEBHOOK: '/webhook/hrdonna',
    HR_DONNA_V2_WEBHOOK: '/webhook/hrdonnaAssistant',
    GAJODHAR_WEBHOOK: '/webhook/MemerAgentfaster',
    TIMEOUT_MS: 180000, // 180 seconds timeout
};

// Construct full webhook URLs
API_CONFIG.HR_DONNA_FULL_URL = `${API_CONFIG.N8N_BASE_URL}${API_CONFIG.HR_DONNA_WEBHOOK}`;
API_CONFIG.HR_DONNA_V2_FULL_URL = `${API_CONFIG.N8N_BASE_URL}${API_CONFIG.HR_DONNA_V2_WEBHOOK}`;
API_CONFIG.GAJODHAR_FULL_URL = `${API_CONFIG.N8N_BASE_URL}${API_CONFIG.GAJODHAR_WEBHOOK}`; // NEW

export default API_CONFIG;