// Response status types from n8n
export const ResponseStatus = {
    SUCCESS: 'success',
    ERROR: 'error',
    TIMEOUT: 'timeout',
    VALIDATION_ERROR: 'validation_error',
    SERVER_ERROR: 'server_error',
    NETWORK_ERROR: 'network_error'
};

// Validate response structure
const validateResponseFormat = (data) => {
    // Check if response is an object
    if (!data || typeof data !== 'object') {
        throw new Error('Invalid response format: Expected an object');
    }

    // Check if output field exists (n8n response format)
    if (!data.output && !data.error) {
        throw new Error('Invalid response format: Missing output field');
    }

    return true;
};

// Parse and validate API response
export const parseApiResponse = (response) => {
    if (!response) {
        throw new Error('Empty response received');
    }

    // Validate response format
    try {
        validateResponseFormat(response);
    } catch (error) {
        throw new Error(`Response validation failed: ${error.message}`);
    }

    // Extract all possible fields from the response
    // Adapt to n8n response format where message is in output field
    const {
        output,
        error,
        metadata,
        status: responseStatus,
        suggestions
    } = response;

    return {
        status: responseStatus || (error ? ResponseStatus.ERROR : ResponseStatus.SUCCESS),
        message: output || error?.message, // Use output field as message
        code: error?.code,
        details: error?.details,
        suggestions: suggestions || error?.suggestions,
        metadata: metadata || null
    };

    return {
        status: status || (error ? ResponseStatus.ERROR : ResponseStatus.SUCCESS),
        message: message || responseText || error?.message,
        code: code || error?.code,
        details: details || error?.details,
        suggestions: suggestions || error?.suggestions,
        metadata: metadata || null
    };
};

// Get appropriate message based on error type
export const getErrorMessage = (error) => {
    if (!error) return null;

    // Network or API-level errors
    if (error.name === 'AbortError') {
        return {
            status: ResponseStatus.TIMEOUT,
            message: error.message || 'Request timed out',
            code: 'TIMEOUT_ERROR'
        };
    }

    if (error.name === 'TypeError' && error.message.includes('NetworkError')) {
        return {
            status: ResponseStatus.NETWORK_ERROR,
            message: 'Unable to connect to the service',
            code: 'NETWORK_ERROR'
        };
    }

    // API response errors
    if (error.response) {
        try {
            const parsedError = parseApiResponse(error.response);
            return {
                status: parsedError.status,
                message: parsedError.message,
                code: parsedError.code,
                details: parsedError.details,
                suggestions: parsedError.suggestions
            };
        } catch (e) {
            // Fallback for unparseable API errors
            return {
                status: ResponseStatus.ERROR,
                message: error.message || 'An unexpected error occurred',
                code: 'UNKNOWN_ERROR'
            };
        }
    }

    // Default error
    return {
        status: ResponseStatus.ERROR,
        message: error.message || 'An unexpected error occurred',
        code: 'UNKNOWN_ERROR'
    };
};