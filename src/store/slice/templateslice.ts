import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { fetchTemplates, createTemplate } from '../thunk/templatethunk';

export interface Template {
  id: string;
  purpose: string;
  goal: string;
  additionalInfo: string | null;
  duration: string;
  createdAt: string;
  updatedAt: string;
}

interface TemplateState {
  loading: boolean;
  error: string | null;
  templates: Template[];
}

const initialState: TemplateState = {
  loading: false,
  error: null,
  templates: [],
};

const templateSlice = createSlice({
  name: 'templates',
  initialState,
  reducers: {
    setTemplates: (state, action: PayloadAction<Template[]>) => {
      state.templates = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Fetch templates
    builder
      .addCase(fetchTemplates.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTemplates.fulfilled, (state, action) => {
        state.loading = false;
        state.templates = action.payload;
        state.error = null;
      })
      .addCase(fetchTemplates.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch templates';
      })
      // Create template
      .addCase(createTemplate.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createTemplate.fulfilled, (state, action) => {
        state.loading = false;
        state.templates.unshift(action.payload); // Add newly created to top
        state.error = null;
      })
      .addCase(createTemplate.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to create template';
      });
  },
});

export const { setTemplates, clearError, setLoading } = templateSlice.actions;
export default templateSlice.reducer;
