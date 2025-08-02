import { createAsyncThunk } from '@reduxjs/toolkit';
import { apiGet } from '@/server/serverAction';
import { API_ENDPOINTS } from '@/server/endpoint';

// Document interface matching the API response
export interface Document {
    id: string;
    fileUrl: string;
    fileName: string | null;
    uploadedAt: string;
    mimeType: string | null;
    fileSize: number | null;
    title: string | null;
    description: string | null;
    isEmbedded: boolean;
}

interface GetDocumentsResponse {
    success: boolean;
    data: Document[];
    message?: string;
    error?: string;
}

/**
 * Async thunk to fetch all documents for the current user
 */
export const fetchDocuments = createAsyncThunk<
    Document[],
    void,
    { rejectValue: string }
>(
    'documents/fetchDocuments',
    async (_, { rejectWithValue }) => {
        try {
            const response = await apiGet<GetDocumentsResponse>(API_ENDPOINTS.GET_DOCUMENTS);

            if (!response.success) {
                return rejectWithValue(response.error || 'Failed to fetch documents');
            }

            return response.data?.data || [];
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error occurred';
            return rejectWithValue(message);
        }
    },
);
