// Typed API client — namespace style. Attaches JWT automatically.

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export const getToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('taskflow_token');
};

export const setToken = (t: string) => {
  if (typeof window !== 'undefined') localStorage.setItem('taskflow_token', t);
};

export const clearToken = () => {
  if (typeof window !== 'undefined') localStorage.removeItem('taskflow_token');
};

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) { super(message); this.status = status; }
}

async function request<T>(path: string, method = 'GET', body?: any): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(data.message || `Request failed (${res.status})`, res.status);
  return data as T;
}

async function uploadFile<T>(path: string, formData: FormData): Promise<T> {
  const headers: Record<string, string> = {};
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, {
    method: 'POST',
    headers,
    body: formData,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(data.message || `Request failed (${res.status})`, res.status);
  return data as T;
}

export const api = {
  // auth
  register: (body: { name: string; email: string; password: string }) =>
    request<{ token: string; user: any }>('/api/auth/register', 'POST', body),
  login: (body: { email: string; password: string }) =>
    request<{ token: string; user: any }>('/api/auth/login', 'POST', body),
  me: () => request<{ user: any }>('/api/auth/me'),
  uploadProfilePic: (formData: FormData) =>
    uploadFile<{ user: any; profilePic: string }>('/api/auth/profile-pic', formData),

  // workspaces
  listWorkspaces: () => request<{ workspaces: any[] }>('/api/workspaces'),
  createWorkspace: (body: { name: string; description?: string; color?: string }) =>
    request<{ workspace: any }>('/api/workspaces', 'POST', body),
  getWorkspace: (id: string) =>
    request<{ workspace: any; myRole: string }>(`/api/workspaces/${id}`),
  joinWorkspace: (inviteCode: string) =>
    request<{ workspaceId: string }>('/api/workspaces/join', 'POST', { inviteCode }),
  updateMemberRole: (wsId: string, memberId: string, role: string) =>
    request<{ message: string }>(`/api/workspaces/${wsId}/members/${memberId}`, 'PATCH', { role }),
  removeMember: (wsId: string, memberId: string) =>
    request<{ message: string }>(`/api/workspaces/${wsId}/members/${memberId}`, 'DELETE'),

  // tasks
  listTasks: (wsId: string) =>
    request<{ tasks: any[] }>(`/api/workspaces/${wsId}/tasks`),
  createTask: (wsId: string, body: any) =>
    request<{ task: any }>(`/api/workspaces/${wsId}/tasks`, 'POST', body),
  updateTask: (wsId: string, taskId: string, body: any) =>
    request<{ task: any }>(`/api/workspaces/${wsId}/tasks/${taskId}`, 'PATCH', body),
  deleteTask: (wsId: string, taskId: string) =>
    request<{ message: string }>(`/api/workspaces/${wsId}/tasks/${taskId}`, 'DELETE'),
  moveTask: (wsId: string, taskId: string, status: string, order: number) =>
    request<{ task: any }>(`/api/workspaces/${wsId}/tasks/${taskId}/move`, 'POST', { status, order }),
};

export { API_URL };
