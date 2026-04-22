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
  updateProfile: (body: { name?: string; username?: string; bio?: string; website?: string; location?: string; avatarColor?: string }) =>
    request<{ user: any }>('/api/auth/profile', 'PATCH', body),
  changePassword: (body: { currentPassword: string; newPassword: string }) =>
    request<{ message: string }>('/api/auth/change-password', 'PATCH', body),
  forgotPassword: (body: { email: string }) =>
    request<{ message: string; devResetUrl?: string; devToken?: string }>('/api/auth/forgot-password', 'POST', body),
  resetPassword: (body: { token: string; newPassword: string }) =>
    request<{ message: string; token: string; user: any }>('/api/auth/reset-password', 'POST', body),
  requestEmailVerification: () =>
    request<{ message: string; devVerifyUrl?: string }>('/api/auth/verify-email/request', 'POST'),
  verifyEmail: (body: { token: string }) =>
    request<{ message: string }>('/api/auth/verify-email', 'POST', body),
  updateNotificationPrefs: (prefs: Record<string, boolean>) =>
    request<{ user: any }>('/api/auth/notification-prefs', 'PATCH', prefs),
  updateTheme: (body: { theme: 'dark' | 'light' | 'system' }) =>
    request<{ user: any }>('/api/auth/theme', 'PATCH', body),
  deleteAccount: (body: { password: string }) =>
    request<{ message: string }>('/api/auth/account', 'DELETE', body),

  // workspaces
  listWorkspaces: () => request<{ workspaces: any[] }>('/api/workspaces'),
  createWorkspace: (body: { name: string; description?: string; color?: string }) =>
    request<{ workspace: any }>('/api/workspaces', 'POST', body),
  getWorkspace: (id: string) =>
    request<{ workspace: any; myRole: string }>(`/api/workspaces/${id}`),
  updateWorkspace: (id: string, body: { name?: string; description?: string; color?: string }) =>
    request<{ workspace: any }>(`/api/workspaces/${id}`, 'PATCH', body),
  deleteWorkspace: (id: string) =>
    request<{ message: string }>(`/api/workspaces/${id}`, 'DELETE'),
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

  // subtasks
  addSubtask: (wsId: string, taskId: string, title: string) =>
    request<{ task: any }>(`/api/workspaces/${wsId}/tasks/${taskId}/subtasks`, 'POST', { title }),
  toggleSubtask: (wsId: string, taskId: string, subtaskId: string, isCompleted: boolean) =>
    request<{ task: any }>(`/api/workspaces/${wsId}/tasks/${taskId}/subtasks/${subtaskId}`, 'PATCH', { isCompleted }),
  deleteSubtask: (wsId: string, taskId: string, subtaskId: string) =>
    request<{ task: any }>(`/api/workspaces/${wsId}/tasks/${taskId}/subtasks/${subtaskId}`, 'DELETE'),

  // comments
  listComments: (wsId: string, taskId: string) =>
    request<{ comments: any[] }>(`/api/workspaces/${wsId}/tasks/${taskId}/comments`),
  addComment: (wsId: string, taskId: string, text: string) =>
    request<{ comment: any }>(`/api/workspaces/${wsId}/tasks/${taskId}/comments`, 'POST', { text }),
  deleteComment: (wsId: string, taskId: string, commentId: string) =>
    request<{ message: string }>(`/api/workspaces/${wsId}/tasks/${taskId}/comments/${commentId}`, 'DELETE'),

  // activity
  listActivity: (wsId: string, limit = 40) =>
    request<{ activities: any[] }>(`/api/workspaces/${wsId}/activity?limit=${limit}`),

  // notifications
  listNotifications: (unreadOnly = false) =>
    request<{ notifications: any[]; unreadCount: number }>(`/api/notifications?${unreadOnly ? 'unread=true' : ''}`),
  markNotificationRead: (id: string) =>
    request<{ message: string }>(`/api/notifications/${id}/read`, 'PATCH'),
  markAllNotificationsRead: () =>
    request<{ message: string }>(`/api/notifications/read-all`, 'PATCH'),
  deleteNotification: (id: string) =>
    request<{ message: string }>(`/api/notifications/${id}`, 'DELETE'),
  clearAllNotifications: () =>
    request<{ message: string }>(`/api/notifications/clear-all`, 'DELETE'),

  // me
  listMyTasks: (params?: { status?: string; priority?: string; dueRange?: string }) => {
    const qs = new URLSearchParams(Object.entries(params || {}).filter(([, v]) => v) as any).toString();
    return request<{ tasks: any[] }>(`/api/me/tasks${qs ? `?${qs}` : ''}`);
  },
  globalSearch: (q: string) =>
    request<{ tasks: any[]; workspaces: any[] }>(`/api/me/search?q=${encodeURIComponent(q)}`),
  analyticsOverview: () =>
    request<{
      totals: any;
      byStatus: Record<string, number>;
      byPriority: Record<string, number>;
      weeklyActivity: { date: string; label: string; count: number }[];
    }>('/api/me/analytics'),
};

export { API_URL };
