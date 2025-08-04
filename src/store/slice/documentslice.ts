import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { fetchDocuments, deleteDocument } from '../thunk/documentsthunk';
import type { Document } from '../thunk/documentsthunk';

interface DocumentState {
    loading: boolean;
    error: string | null;
    documents: Document[];
}

const initialState: DocumentState = {
    loading: false,
    error: null,
    documents: [],
};

const documentSlice = createSlice({
    name: 'documents',
    initialState,
    reducers: {
        setDocuments: (state, action: PayloadAction<Document[]>) => {
            state.documents = action.payload;
        },
        clearError: (state) => {
            state.error = null;
        },
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.loading = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchDocuments.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchDocuments.fulfilled, (state, action) => {
                state.loading = false;
                state.documents = action.payload;
                state.error = null;
            })
            .addCase(fetchDocuments.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Failed to fetch documents';
            })
            .addCase(deleteDocument.pending, (state) => {
                state.loading = true;
            })
            .addCase(deleteDocument.fulfilled, (state, action) => {
                state.loading = false;
                state.documents = state.documents.filter(doc => doc.id !== action.payload);
            })
            .addCase(deleteDocument.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Failed to delete document';
            });
    },
});

export const { setDocuments, clearError, setLoading } = documentSlice.actions;
export default documentSlice.reducer;
