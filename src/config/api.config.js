const API_CONFIG = {
    // Use environment variables with fallback values
    N8N_BASE_URL: import.meta.env.VITE_N8N_BASE_URL || 'http://localhost:5678',
    HR_DONNA_WEBHOOK: '/webhook/hrdonna',
    TIMEOUT_MS: 30000, // 30 seconds timeout
};

// Construct full webhook URL
API_CONFIG.HR_DONNA_FULL_URL = `${API_CONFIG.N8N_BASE_URL}${API_CONFIG.HR_DONNA_WEBHOOK}`;

export default API_CONFIG;