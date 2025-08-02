import { createAsyncThunk } from '@reduxjs/toolkit';
import { apiGet } from '@/server/serverAction';
import { API_ENDPOINTS } from '@/server/endpoint';

// Types for the session data
interface Document {
    id: string;
    fileUrl: string;
}

interface Template {
    purpose: string;
    goal: string;
    additionalInfo: string;
}

interface AppSession {
    id: string;
    name: string;
    description: string;
    createdAt: string;
    isActive: boolean;
    documents: Document[];
    template: Template;
}

interface GetAppSessionsResponse {
    success: boolean;
    data: AppSession[];
    message?: string;
    error?: string;
}

/**
 * Async thunk to fetch all app sessions
 */
export const fetchAppSessions = createAsyncThunk<
    AppSession[],
    void,
    {
        rejectValue: string;
    }
>(
    'appSessions/fetchAppSessions',
    async (_, { rejectWithValue }) => {
        try {
            const response = await apiGet<GetAppSessionsResponse>(API_ENDPOINTS.GET_APPSESSIONS);
            
            if (!response.success) {
                return rejectWithValue(response.error || 'Failed to fetch app sessions');
            }
            
            return response.data?.data || [];
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return rejectWithValue(errorMessage);
        }
    }
);

/**
 * Async thunk to fetch a specific app session by ID
 */
export const fetchAppSessionById = createAsyncThunk<
    AppSession,
    string,
    {
        rejectValue: string;
    }
>(
    'appSessions/fetchAppSessionById',
    async (sessionId, { rejectWithValue }) => {
        try {
            const response = await apiGet<{ success: boolean; data: AppSession; message?: string; error?: string; }>(
                `${API_ENDPOINTS.GET_APPSESSIONS}/${sessionId}`
            );
            
            if (!response.success) {
                return rejectWithValue(response.error || 'Failed to fetch app session');
            }
            
            if (!response.data?.data) {
                return rejectWithValue('App session not found');
            }
            
            return response.data.data;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return rejectWithValue(errorMessage);
        }
    }
);

/**
 * Async thunk to refresh app sessions (same as fetch but can be used for refresh scenarios)
 */
export const refreshAppSessions = createAsyncThunk<
    AppSession[],
    void,
    {
        rejectValue: string;
    }
>(
    'appSessions/refreshAppSessions',
    async (_, { rejectWithValue }) => {
        try {
            const response = await apiGet<GetAppSessionsResponse>(API_ENDPOINTS.GET_APPSESSIONS);
            
            if (!response.success) {
                return rejectWithValue(response.error || 'Failed to refresh app sessions');
            }
            
            return response.data?.data || [];
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return rejectWithValue(errorMessage);
        }
    }
);