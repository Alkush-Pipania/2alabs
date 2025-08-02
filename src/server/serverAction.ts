interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}

interface RequestOptions {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
    headers?: Record<string, string>;
    body?: any;
}

/**
 * Common GET function for API requests
 * @param endpoint - The API endpoint to call
 * @param options - Optional request configuration
 * @returns Promise with the API response
 */
export async function apiGet<T = any>(
    endpoint: string,
    options: Omit<RequestOptions, 'method'> = {}
): Promise<ApiResponse<T>> {
    try {
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || '';
        const url = `${baseUrl}${endpoint}`;
        
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
        });

        if (!response.ok) {
            return {
                success: false,
                error: `HTTP error! status: ${response.status}`,
                message: response.statusText
            };
        }

        const data = await response.json();
        return {
            success: true,
            data
        };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error occurred',
            message: 'Failed to fetch data'
        };
    }
}

/**
 * Common POST function for API requests
 * @param endpoint - The API endpoint to call
 * @param options - Request configuration including body
 * @returns Promise with the API response
 */
export async function apiPost<T = any>(
    endpoint: string,
    options: Omit<RequestOptions, 'method'> = {}
): Promise<ApiResponse<T>> {
    try {
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || '';
        const url = `${baseUrl}${endpoint}`;
        
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
            body: options.body ? JSON.stringify(options.body) : undefined,
        });

        if (!response.ok) {
            return {
                success: false,
                error: `HTTP error! status: ${response.status}`,
                message: response.statusText
            };
        }

        const data = await response.json();
        return {
            success: true,
            data
        };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error occurred',
            message: 'Failed to post data'
        };
    }
}

/**
 * Generic API request function
 * @param endpoint - The API endpoint to call
 * @param options - Request configuration
 * @returns Promise with the API response
 */
export async function apiRequest<T = any>(
    endpoint: string,
    options: RequestOptions = {}
): Promise<ApiResponse<T>> {
    try {
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || '';
        const url = `${baseUrl}${endpoint}`;
        
        const response = await fetch(url, {
            method: options.method || 'GET',
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
            body: options.body ? JSON.stringify(options.body) : undefined,
        });

        if (!response.ok) {
            return {
                success: false,
                error: `HTTP error! status: ${response.status}`,
                message: response.statusText
            };
        }

        const data = await response.json();
        return {
            success: true,
            data
        };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error occurred',
            message: 'Failed to complete request'
        };
    }
}