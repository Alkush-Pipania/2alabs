import { createAsyncThunk } from '@reduxjs/toolkit';
import { apiGet, apiPost, apiRequest } from '@/server/serverAction';
import { API_ENDPOINTS } from '@/server/endpoint';

export interface Template {
  id: string;
  purpose: string;
  goal: string;
  additionalInfo: string | null;
  duration: string;
  createdAt: string;
  updatedAt: string;
}

interface ApiSuccessList {
  success: boolean;
  data: Template[];
  message?: string;
  error?: string;
}

interface ApiSuccessSingle {
  success: boolean;
  data: Template;
  message?: string;
  error?: string;
}

interface NewTemplatePayload {
  purpose: string;
  goal: string;
  additionalInfo?: string;
  duration?: string;
}

/**
 * Fetch templates for current user
 */
export const fetchTemplates = createAsyncThunk<
  Template[],
  void,
  { rejectValue: string }
>('templates/fetchTemplates', async (_, { rejectWithValue }) => {
  try {
    const response = await apiGet<ApiSuccessList>(API_ENDPOINTS.GET_TEMPLATES);
    if (!response.success) {
      return rejectWithValue(response.error || 'Failed to fetch templates');
    }
    return response.data?.data || [];
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error occurred';
    return rejectWithValue(msg);
  }
});

/**
 * Create a template
 */
export const createTemplate = createAsyncThunk<
  Template,
  NewTemplatePayload,
  { rejectValue: string }
>('templates/createTemplate', async (payload, { rejectWithValue }) => {
  try {
    const response = await apiPost<ApiSuccessSingle>(API_ENDPOINTS.CREATE_TEMPLATE, {
      body: payload,
    });
    if (!response.success) {
      return rejectWithValue(response.error || 'Failed to create template');
    }
    return response.data!.data;
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error occurred';
    return rejectWithValue(msg);
  }
});

/**
 * Update a template
 */
export const updateTemplate = createAsyncThunk<
  Template,
  Partial<Template> & { id: string },
  { rejectValue: string }
>('templates/updateTemplate', async (payload, { rejectWithValue }) => {
  try {
    const response = await apiRequest<ApiSuccessSingle>(API_ENDPOINTS.UPDATE_TEMPLATE, {
      method: 'PUT',
      body: payload,
    });
    if (!response.success) {
      return rejectWithValue(response.error || 'Failed to update template');
    }
    return response.data!.data;
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error occurred';
    return rejectWithValue(msg);
  }
});


