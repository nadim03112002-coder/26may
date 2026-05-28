import React, { useEffect, useState } from 'react';
import { rtdb } from '../../firebase';
import { ref, onValue, update, remove, query as rtdbQuery, orderByChild, limitToLast } from 'firebase/database';
import { AlertTriangle, ArrowLeft, RefreshCw, Trash2, CheckCircle, Clock, Monitor, Smartphone, Tablet, X } from 'lucide-react';
import { AppError } from '../../utils/errorLogger';

interface Props {
  onBack: () => void;
}

const SEV_COLORS: Record<string, { bg: string; border: string; text: string; badge: string }> = {
  low:      { bg: 'bg-slate-50',   border: 'border-slate-200',  text: 'text-slate-600',  badge: 'bg-slate-100 text-slate-500' },
  medium:   { bg: 'bg-amber-50',   border: 'border-amber-200',  text: 'text-amber-700',  badge: 'bg-amber-100 text-amber-700' },
  high:     { bg: 'bg-orange-50',  border: 'border-orange-200', text: 'text-orange-700', badge: 'bg-orange-100 text-orange-700' },
  critical: { bg: 'bg-red-50',     border: 'border-red-200',    text: 'text-red-700',    badge: 'bg-red-100 text-red-700' },
};

const TYPE_EMOJI: Record<string, string> = {
  react: '⚛️', runtime: '💥', promise: '🔮', network: '🌐', manual: '📋'
};

const DEVICE_ICON: Record<string, React.ReactNode> = {
  mobile: <Smartphone size={11} />,
  tablet: <Tablet size={11} />,
  desktop: <Monitor size={11} />,
};

function formatTime(ts: number): string {
  const diff = Date.now() - ts;
  if (diff < 60_000) return `${Math.floor(diff / 1000)}s ago`;
  if (diff < 3600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86400_000) return `${Math.floor(diff / 3600_000)}h ago`;
  return new Date(ts).toLocaleDateString('en-IN');
}

export const ErrorNoticeBoard: React.FC<Props> = ({ onBack }) => {
  const [errors, setErrors] = useState<Array<AppError & { id: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'undismissed' | 'critical'>('undismissed');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [clearing, setClearing] = useState(false);

  useEffect(() => {
    const q = rtdbQuery(ref(rtdb, 'error_logs'), orderByChild('timestamp'), limitToLast(200));
    const unsub = onValue(q, snap => {
      const items: Array<AppError & { id: string }> = [];
      snap.forEach(child => {
        items.push({ ...child.val(), id: child.key! });
      });
      items.reverse();
      setErrors(items);
      setLoading(false);
    }, () => setLoading(false));
    return unsub;
  }, []);

  const handleDismiss = async (id: string) => {
    await update(ref(rtdb, `error_logs/${id}`), { dismissed: true }).catch(() => {});
  };

  const handleDelete = async (id: string) => {
    await remove(ref(rtdb, `error_logs/${id}`)).catch(() => {});
  };

  const handleClearAll = async () => {
    if (!window.confirm('Sab error logs delete ho jayenge. Confirm?')) return;
    setClearing(true);
    await Promise.all(errors.map(e => remove(ref(rtdb, `error_logs/${e.id}`)))).catch(() => {});
    setClearing(false);
  };

  const filtered = errors.filter(e => {
    if (filter === 'undismissed') return !e.dismissed;
    if (filter === 'critical') return e.severity === 'critical' || e.severity === 'high';
    return true;
  });

  const undismissedCount = errors.filter(e => !e.dismissed).length;
  const criticalCount = errors.filter(e => e.severity === 'critical' || e.severity === 'high').length;

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">

      {/* Header */}
      <div className="p-4 border-b border-slate-100 bg-gradient-to-r from-red-50 to-orange-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={onBack} className="bg-white p-2 rounded-full shadow-sm hover:bg-slate-50 text-slate-600">
              <ArrowLeft size={18} />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <AlertTriangle size={16} className="text-red-500" />
                <h2 className="font-black text-slate-800">Error Notice Board</h2>
                {undismissedCount > 0 && (
                  <span className="text-[10px] font-black bg-red-500 text-white px-2 py-0.5 rounded-full animate-pulse">
                    {undismissedCount} NEW
                  </span>
                )}
              </div>
              <p className="text-[10px] text-slate-500 mt-0.5">Real-time app crash + error monitor — firebase se live</p>
            </div>
          </div>
          <button onClick={handleClearAll} disabled={clearing || errors.length === 0}
            className="flex items-center gap-1.5 text-[10px] font-bold text-red-500 bg-red-50 border border-red-200 px-3 py-1.5 rounded-lg hover:bg-red-100 disabled:opacity-40 transition-colors">
            {clearing ? <RefreshCw size={11} className="animate-spin" /> : <Trash2 size={11} />}
            Clear All
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-2 mt-3">
          {[
            { label: 'Total', count: errors.length, color: 'slate' },
            { label: 'New', count: undismissedCount, color: 'red' },
            { label: 'Critical/High', count: criticalCount, color: 'orange' },
            { label: 'Dismissed', count: errors.length - undismissedCount, color: 'green' },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-xl p-2 text-center shadow-sm border border-slate-100">
              <p className={`text-lg font-black text-${s.color}-600`}>{s.count}</p>
              <p className="text-[8px] font-bold text-slate-400 uppercase">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex border-b border-slate-100 bg-slate-50">
        {(['undismissed', 'all', 'critical'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`flex-1 py-2.5 text-[10px] font-black uppercase tracking-wide transition-colors ${filter === f ? 'text-red-600 border-b-2 border-red-500 bg-white' : 'text-slate-400 hover:text-slate-600'}`}>
            {f === 'undismissed' ? `New (${undismissedCount})` : f === 'critical' ? `Critical (${criticalCount})` : `All (${errors.length})`}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto">
        {loading && (
          <div className="text-center py-12">
            <RefreshCw size={24} className="animate-spin text-slate-300 mx-auto mb-2" />
            <p className="text-sm text-slate-400">Loading error logs…</p>
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="text-center py-12">
            <CheckCircle size={36} className="mx-auto mb-3 text-green-400" />
            <p className="font-bold text-slate-600">Sab thik hai!</p>
            <p className="text-xs text-slate-400 mt-1">
              {filter === 'undismissed' ? 'Koi naya error nahi' : 'Koi error nahi aayi abhi tak'}
            </p>
          </div>
        )}

        {filtered.map(err => {
          const sev = SEV_COLORS[err.severity] || SEV_COLORS.medium;
          const isOpen = expanded === err.id;
          return (
            <div key={err.id} className={`${sev.bg} ${err.dismissed ? 'opacity-50' : ''} transition-all`}>
              {/* Main row */}
              <div className="p-3">
                <div className="flex items-start gap-2">
                  {/* Type emoji */}
                  <span className="text-base leading-none mt-0.5 shrink-0">{TYPE_EMOJI[err.type] || '⚠️'}</span>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap mb-1">
                      <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded ${sev.badge}`}>{err.severity}</span>
                      <span className="text-[9px] text-slate-400 font-mono">{err.type}</span>
                      <span className="flex items-center gap-0.5 text-[9px] text-slate-400">
                        {DEVICE_ICON[err.device] || <Monitor size={11} />} {err.device}
                      </span>
                      {err.dismissed && <span className="text-[9px] text-green-500 font-bold">✓ Dismissed</span>}
                    </div>

                    <p className="text-xs font-bold text-slate-800 truncate">{err.message}</p>

                    <div className="flex items-center gap-2 mt-1">
                      <span className="flex items-center gap-1 text-[9px] text-slate-400">
                        <Clock size={10} /> {formatTime(err.timestamp)}
                      </span>
                      {err.userName && (
                        <span className="text-[9px] text-slate-500 font-medium">
                          👤 {err.userName} ({err.userRole})
                        </span>
                      )}
                      {err.url && (
                        <span className="text-[9px] text-blue-400 font-mono truncate max-w-[100px]">{err.url}</span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={() => setExpanded(isOpen ? null : err.id)}
                      className="text-[9px] text-slate-400 hover:text-slate-600 bg-white border border-slate-200 px-1.5 py-1 rounded-lg font-bold transition-colors">
                      {isOpen ? 'Less' : 'More'}
                    </button>
                    {!err.dismissed && (
                      <button onClick={() => handleDismiss(err.id)} title="Mark dismissed"
                        className="p-1 rounded-lg bg-green-50 text-green-500 hover:bg-green-100 border border-green-200 transition-colors">
                        <CheckCircle size={12} />
                      </button>
                    )}
                    <button onClick={() => handleDelete(err.id)} title="Delete"
                      className="p-1 rounded-lg bg-red-50 text-red-400 hover:bg-red-100 border border-red-200 transition-colors">
                      <X size={12} />
                    </button>
                  </div>
                </div>

                {/* Expanded detail */}
                {isOpen && (
                  <div className="mt-2 space-y-1.5 pl-6">
                    {err.stack && (
                      <div>
                        <p className="text-[9px] font-bold text-slate-500 mb-0.5">Stack Trace:</p>
                        <pre className="text-[8px] font-mono text-slate-600 bg-white border border-slate-200 rounded-lg p-2 overflow-auto max-h-24 whitespace-pre-wrap break-words">{err.stack}</pre>
                      </div>
                    )}
                    {err.componentStack && (
                      <div>
                        <p className="text-[9px] font-bold text-slate-500 mb-0.5">Component Stack:</p>
                        <pre className="text-[8px] font-mono text-slate-600 bg-white border border-slate-200 rounded-lg p-2 overflow-auto max-h-24 whitespace-pre-wrap break-words">{err.componentStack}</pre>
                      </div>
                    )}
                    {err.userId && (
                      <p className="text-[9px] text-slate-500">User ID: <span className="font-mono">{err.userId}</span></p>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
