import { rtdb } from '../firebase';
import { ref, push, serverTimestamp } from 'firebase/database';

export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface AppError {
  id?: string;
  message: string;
  stack?: string;
  componentStack?: string;
  type: 'react' | 'runtime' | 'promise' | 'network' | 'manual';
  severity: ErrorSeverity;
  url: string;
  userId?: string;
  userName?: string;
  userRole?: string;
  device: string;
  timestamp: number;
  ts?: object;
  dismissed?: boolean;
}

let _currentUserId: string | null = null;
let _currentUserName: string | null = null;
let _currentUserRole: string | null = null;

export function setErrorLoggerUser(id: string | null, name: string | null, role: string | null) {
  _currentUserId = id;
  _currentUserName = name;
  _currentUserRole = role;
}

function getDevice(): string {
  const ua = navigator.userAgent;
  const isMobile = /Mobi|Android/i.test(ua);
  const isTablet = /iPad|Tablet/i.test(ua);
  return isTablet ? 'tablet' : isMobile ? 'mobile' : 'desktop';
}

function classifyError(message: string): ErrorSeverity {
  const lower = message.toLowerCase();
  if (lower.includes('chunkloaderror') || lower.includes('loading chunk') || lower.includes('network error')) return 'low';
  if (lower.includes('firestore') || lower.includes('firebase') || lower.includes('permission')) return 'high';
  if (lower.includes('cannot read') || lower.includes('is not a function') || lower.includes('undefined is not')) return 'medium';
  if (lower.includes('out of memory') || lower.includes('stack overflow') || lower.includes('quota')) return 'critical';
  return 'medium';
}

const _recentErrors = new Set<string>();

export async function logErrorToFirebase(
  error: Error | string,
  opts: {
    type?: AppError['type'];
    componentStack?: string;
    severity?: ErrorSeverity;
  } = {}
): Promise<void> {
  try {
    const message = typeof error === 'string' ? error : (error?.message || String(error));
    const stack = typeof error === 'string' ? undefined : error?.stack;

    const dedupeKey = message.slice(0, 120);
    if (_recentErrors.has(dedupeKey)) return;
    _recentErrors.add(dedupeKey);
    setTimeout(() => _recentErrors.delete(dedupeKey), 30_000);

    const severity = opts.severity ?? classifyError(message);

    const payload: AppError = {
      message: message.slice(0, 500),
      stack: stack?.slice(0, 1000),
      componentStack: opts.componentStack?.slice(0, 800),
      type: opts.type ?? 'runtime',
      severity,
      url: window.location.pathname,
      userId: _currentUserId ?? undefined,
      userName: _currentUserName ?? undefined,
      userRole: _currentUserRole ?? undefined,
      device: getDevice(),
      timestamp: Date.now(),
      ts: serverTimestamp() as object,
      dismissed: false,
    };

    Object.keys(payload).forEach(k => {
      if ((payload as Record<string, unknown>)[k] === undefined) delete (payload as Record<string, unknown>)[k];
    });

    await push(ref(rtdb, 'error_logs'), payload);
  } catch {
  }
}
