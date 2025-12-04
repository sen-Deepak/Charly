import API_CONFIG from '../config/api.config';
import { parseApiResponse, getErrorMessage, ResponseStatus } from '../utils/apiResponses';
import { supabase } from '../supabaseClient';

export class ApiError extends Error {
    constructor(errorResponse) {
        super(errorResponse.message);
        Object.assign(this, errorResponse);
        this.name = 'ApiError';
    }
}

async function getUserSession() {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;
    if (!session) throw new Error('No active session');
    return session;
}

export const chatService = {
    /**
     * For HR Donna agent (supports v1 and v2 via version parameter)
     */
    async sendMessage(message, version = 'v1', chatId) {
        const url = version === 'v2' 
            ? API_CONFIG.HR_DONNA_V2_FULL_URL 
            : API_CONFIG.HR_DONNA_FULL_URL;
        return chatService.sendAgentMessage({
            message,
            chatId,
            url,
        });
    },

    /**
     * For other chat agents, allows custom webhook URL
     */
    async sendAgentMessage({ message, chatId, url }) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT_MS);

        try {
            // Get user session
            const session = await getUserSession();
            const { user } = session;

            // Prepare request payload with user context
            const payload = {
                message,
                chatId,
                user: {
                    email: user.email,
                    id: user.id,
                    user_metadata: user.user_metadata
                },
                timestamp: new Date().toISOString()
            };

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${session.access_token}`
                },
                body: JSON.stringify(payload),
                signal: controller.signal,
            });

            clearTimeout(timeoutId);

            // Check if the response is empty
            const contentType = response.headers.get("content-type");
            if (!contentType || !contentType.includes("application/json")) {
                throw new ApiError({
                    status: ResponseStatus.ERROR,
                    message: 'Invalid response format: Server did not return JSON',
                    code: 'INVALID_RESPONSE_FORMAT',
                    details: `Received content-type: ${contentType || 'none'}`
                });
            }

            let data;
            try {
                const text = await response.text();
                if (!text) {
                    throw new Error('Empty response');
                }
                data = JSON.parse(text);
            } catch (error) {
                throw new ApiError({
                    status: ResponseStatus.ERROR,
                    message: 'Failed to parse server response',
                    code: 'PARSE_ERROR',
                    details: error.message,
                    suggestions: ['Please try again', 'Contact support if the issue persists']
                });
            }

            // If response is not ok, the data might contain error details
            if (!response.ok) {
                throw new ApiError(getErrorMessage({
                    response: data,
                    status: response.status
                }));
            }

            // Parse successful response
            const parsedResponse = parseApiResponse(data);

            // Even with a 200 status, the API might indicate an error in the response body
            if (parsedResponse.status === ResponseStatus.ERROR) {
                throw new ApiError(parsedResponse);
            }

            return parsedResponse;
        } catch (error) {
            // If it's already an ApiError, rethrow it
            if (error instanceof ApiError) {
                throw error;
            }

            // Handle other types of errors (network, timeout, etc.)
            throw new ApiError(getErrorMessage(error));
        } finally {
            clearTimeout(timeoutId);
        }
    },
};