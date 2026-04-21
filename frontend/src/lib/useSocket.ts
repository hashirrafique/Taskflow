'use client';
import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { API_URL, getToken } from './api';

type Handlers = {
  onTaskCreated?: (task: any) => void;
  onTaskUpdated?: (task: any) => void;
  onTaskMoved?: (task: any) => void;
  onTaskDeleted?: (payload: { _id: string }) => void;
};

export function useWorkspaceSocket(workspaceId: string | null, handlers: Handlers) {
  const socketRef = useRef<Socket | null>(null);
  // Keep latest handlers in a ref so socket connection doesn't churn
  const handlersRef = useRef(handlers);
  handlersRef.current = handlers;

  useEffect(() => {
    if (!workspaceId) return;
    const token = getToken();
    if (!token) return;

    const socket = io(API_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      socket.emit('workspace:join', workspaceId);
    });

    socket.on('task:created', (t) => handlersRef.current.onTaskCreated?.(t));
    socket.on('task:updated', (t) => handlersRef.current.onTaskUpdated?.(t));
    socket.on('task:moved', (t) => handlersRef.current.onTaskMoved?.(t));
    socket.on('task:deleted', (p) => handlersRef.current.onTaskDeleted?.(p));

    return () => {
      socket.emit('workspace:leave', workspaceId);
      socket.disconnect();
      socketRef.current = null;
    };
  }, [workspaceId]);
}
