'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { formatDate } from '@/lib/utils';
import {
  Users,
  Search,
  Coins,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  PlusCircle,
  MinusCircle,
  Eye,
  AlertCircle,
} from 'lucide-react';

interface UserData {
  id: string;
  name: string;
  email: string;
  phone?: string;
  country?: string;
  role: string;
  status: string;
  availablePoints: number;
  createdAt: string;
  _count: {
    submissions: number;
    redemptions: number;
  };
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Point Adjustment Modal state (Section 19)
  const [adjustingUser, setAdjustingUser] = useState<UserData | null>(null);
  const [adjustPoints, setAdjustPoints] = useState<number | string>('');
  const [adjustType, setAdjustType] = useState<'ADD' | 'DEDUCT'>('ADD');
  const [adjustReason, setAdjustReason] = useState('');
  const [adjustDescription, setAdjustDescription] = useState('');
  const [isAdjusting, setIsAdjusting] = useState(false);
  const [adjustError, setAdjustError] = useState<string | null>(null);

  // Suspend/Activate Modal
  const [statusChangeUser, setStatusChangeUser] = useState<UserData | null>(null);
  const [statusReason, setStatusReason] = useState('');
  const [isChangingStatus, setIsChangingStatus] = useState(false);

  const fetchUsers = () => {
    setLoading(true);
    api
      .get<UserData[]>('/users/admin/all', {
        status: statusFilter === 'ALL' ? undefined : statusFilter,
        search: search || undefined,
      })
      .then((data) => setUsers(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchUsers();
  }, [statusFilter]);

  const handleOpenAdjust = (u: UserData) => {
    setAdjustingUser(u);
    setAdjustPoints('');
    setAdjustType('ADD');
    setAdjustReason('');
    setAdjustDescription('Manual bonus for verified campaign');
    setAdjustError(null);
  };

  const handleConfirmAdjust = async () => {
    if (!adjustingUser) return;
    if (!adjustPoints || Number(adjustPoints) <= 0) {
      setAdjustError('Points adjustment must be greater than zero');
      return;
    }
    if (!adjustReason.trim() || adjustReason.trim().length < 5) {
      setAdjustError('A mandatory reason (at least 5 characters) is required for audit logs');
      return;
    }

    setIsAdjusting(true);
    setAdjustError(null);

    try {
      const finalPoints = adjustType === 'ADD' ? Number(adjustPoints) : -Number(adjustPoints);
      await api.post(`/points/admin/adjust/${adjustingUser.id}`, {
        points: finalPoints,
        reason: adjustReason.trim(),
        description: adjustDescription.trim() || `Manual adjustment by admin (${finalPoints > 0 ? '+' : ''}${finalPoints} PTS)`,
      });

      setAdjustingUser(null);
      fetchUsers();
    } catch (err: any) {
      setAdjustError(err.message || 'Points adjustment failed');
    } finally {
      setIsAdjusting(false);
    }
  };

  const handleConfirmStatusChange = async () => {
    if (!statusChangeUser || !statusReason.trim()) {
      alert('A reason is mandatory for changing user account status');
      return;
    }

    setIsChangingStatus(true);
    const newStatus = statusChangeUser.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';

    try {
      await api.patch(`/users/admin/${statusChangeUser.id}/status`, {
        status: newStatus,
        reason: statusReason.trim(),
      });
      setStatusChangeUser(null);
      fetchUsers();
    } catch (err: any) {
      alert(err.message || 'Status update failed');
    } finally {
      setIsChangingStatus(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Trader Management</h1>
          <p className="text-xs text-slate-400">
            Search traders, inspect purchase histories, adjust points with audited reasons, and manage account statuses.
          </p>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            fetchUsers();
          }}
          className="flex items-center gap-2"
        >
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
            <input
              type="text"
              placeholder="Search by name, email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-900 pl-8 pr-3 py-1.5 text-xs text-white focus:border-purple-500 focus:outline-none"
            />
          </div>
          <Button type="submit" size="sm" variant="secondary">
            Filter
          </Button>
        </form>
      </div>

      {/* Status filter tabs */}
      <div className="flex items-center gap-2">
        {['ALL', 'ACTIVE', 'SUSPENDED'].map((st) => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              statusFilter === st
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
            }`}
          >
            {st}
          </button>
        ))}
      </div>

      {/* Users Table */}
      <Card className="p-0 overflow-hidden border-slate-800 bg-slate-900/60">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">Loading traders...</div>
        ) : users.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500">No users found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="px-5 py-3.5">Trader Name & Email</th>
                  <th className="px-5 py-3.5">Country</th>
                  <th className="px-5 py-3.5">Available Balance</th>
                  <th className="px-5 py-3.5">Purchases</th>
                  <th className="px-5 py-3.5">Redemptions</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="font-semibold text-white">{u.name}</div>
                      <div className="text-[11px] text-slate-500 font-mono">{u.email}</div>
                    </td>
                    <td className="px-5 py-3.5 text-slate-300">{u.country || 'N/A'}</td>
                    <td className="px-5 py-3.5 font-bold text-emerald-400 whitespace-nowrap">
                      {u.availablePoints.toLocaleString()} PTS
                    </td>
                    <td className="px-5 py-3.5">{u._count.submissions} submitted</td>
                    <td className="px-5 py-3.5">{u._count.redemptions} orders</td>
                    <td className="px-5 py-3.5">
                      <Badge variant={u.status === 'ACTIVE' ? 'success' : 'danger'}>
                        {u.status}
                      </Badge>
                    </td>
                    <td className="px-5 py-3.5 text-right whitespace-nowrap space-x-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleOpenAdjust(u)}
                        className="text-xs"
                      >
                        <Coins className="h-3.5 w-3.5 mr-1 text-emerald-400" />
                        Adjust Points
                      </Button>

                      {u.role !== 'ADMIN' && (
                        <Button
                          size="sm"
                          variant={u.status === 'ACTIVE' ? 'danger' : 'outline'}
                          onClick={() => {
                            setStatusChangeUser(u);
                            setStatusReason('');
                          }}
                          className="text-xs"
                        >
                          {u.status === 'ACTIVE' ? 'Suspend' : 'Activate'}
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Point Adjustment Modal with MANDATORY Reason (Section 19) */}
      <Modal
        isOpen={!!adjustingUser}
        onClose={() => setAdjustingUser(null)}
        title="Admin Point Adjustment"
        description="Every point change requires a verified administrative justification for audit logs."
      >
        {adjustingUser && (
          <div className="space-y-4">
            {adjustError && (
              <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-xs text-rose-400 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{adjustError}</span>
              </div>
            )}

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500">Trader:</span>
                <strong className="text-white">{adjustingUser.name} ({adjustingUser.email})</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Current Balance:</span>
                <span className="text-emerald-400 font-bold">{adjustingUser.availablePoints.toLocaleString()} PTS</span>
              </div>
            </div>

            {/* Adjustment Type Switch */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setAdjustType('ADD')}
                className={`py-2 text-xs font-bold rounded-lg border transition-all flex items-center justify-center gap-1.5 ${
                  adjustType === 'ADD'
                    ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400'
                    : 'border-slate-800 text-slate-400 bg-slate-900'
                }`}
              >
                <PlusCircle className="h-4 w-4" />
                <span>Add Points (+)</span>
              </button>
              <button
                type="button"
                onClick={() => setAdjustType('DEDUCT')}
                className={`py-2 text-xs font-bold rounded-lg border transition-all flex items-center justify-center gap-1.5 ${
                  adjustType === 'DEDUCT'
                    ? 'bg-rose-500/10 border-rose-500 text-rose-400'
                    : 'border-slate-800 text-slate-400 bg-slate-900'
                }`}
              >
                <MinusCircle className="h-4 w-4" />
                <span>Deduct Points (-)</span>
              </button>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Points Amount *</label>
              <input
                type="number"
                required
                min={1}
                placeholder="e.g. 2000"
                value={adjustPoints}
                onChange={(e) => setAdjustPoints(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">
                Reason (Mandatory Audit Justification) *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Manual bonus for verified campaign / Discord event winner"
                value={adjustReason}
                onChange={(e) => setAdjustReason(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Description on User Ledger</label>
              <input
                type="text"
                value={adjustDescription}
                onChange={(e) => setAdjustDescription(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
              <Button variant="ghost" size="sm" onClick={() => setAdjustingUser(null)} disabled={isAdjusting}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" isLoading={isAdjusting} onClick={handleConfirmAdjust}>
                Confirm Adjustment
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Suspend / Activate User Modal */}
      <Modal
        isOpen={!!statusChangeUser}
        onClose={() => setStatusChangeUser(null)}
        title={statusChangeUser?.status === 'ACTIVE' ? 'Suspend Trader Account' : 'Reactivate Trader Account'}
        description={`Target user: ${statusChangeUser?.name} (${statusChangeUser?.email})`}
      >
        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">
              Reason for Status Change * (Mandatory)
            </label>
            <textarea
              rows={2}
              required
              placeholder="e.g. Repeated duplicate submission attempts or customer request."
              value={statusReason}
              onChange={(e) => setStatusReason(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white focus:border-purple-500 focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
            <Button variant="ghost" size="sm" onClick={() => setStatusChangeUser(null)}>
              Cancel
            </Button>
            <Button
              variant={statusChangeUser?.status === 'ACTIVE' ? 'danger' : 'primary'}
              size="sm"
              isLoading={isChangingStatus}
              onClick={handleConfirmStatusChange}
            >
              Confirm {statusChangeUser?.status === 'ACTIVE' ? 'Suspension' : 'Reactivation'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
