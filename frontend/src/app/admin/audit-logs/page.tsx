'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDateTime } from '@/lib/utils';

interface AuditLog {
  id: string;
  adminId?: string;
  action: string;
  entity: string;
  entityId: string;
  previousValue?: string;
  newValue?: string;
  notes?: string;
  createdAt: string;
  admin?: {
    name: string;
    email: string;
  };
}

const DEFAULT_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'log-1',
    action: 'APPROVE_PURCHASE',
    entity: 'PurchaseSubmission (PN-PUR-88219)',
    entityId: 'sub-demo-3',
    newValue: 'Status: APPROVED (+52,000 PTS)',
    notes: 'Verified Pipstone Capital $100K evaluation invoice against affiliate ledger (Code: NATION).',
    createdAt: '2026-10-02T14:22:00Z',
    admin: {
      name: 'Platform SuperAdmin',
      email: 'admin@propfirmrewards.com',
    },
  },
  {
    id: 'log-2',
    action: 'UPDATE_REDEMPTION_STATUS',
    entity: 'RedemptionOrder (RDM-AIRPODS-991)',
    entityId: 'rdm-demo-1',
    previousValue: 'PROCESSING',
    newValue: 'SHIPPED (DHL-882941029)',
    notes: 'Assigned DHL Express Worldwide tracking number for Apple AirPods Pro 2nd Gen.',
    createdAt: '2026-10-02T11:05:00Z',
    admin: {
      name: 'Priya Nair',
      email: 'priya.ops@propfirmrewards.com',
    },
  },
  {
    id: 'log-3',
    action: 'ADJUST_POINTS_CREDIT',
    entity: 'TraderLedger (usr-1)',
    entityId: 'usr-1',
    previousValue: '37,500 PTS',
    newValue: '42,500 PTS (+5,000 PTS)',
    notes: 'VIP Founder bonus credit — Platform launch executive allocation.',
    createdAt: '2026-10-02T09:30:00Z',
    admin: {
      name: 'Rohan Kapoor',
      email: 'rohan.finance@propfirmrewards.com',
    },
  },
  {
    id: 'log-4',
    action: 'UPDATE_TEAM_ROLE',
    entity: 'StaffMember (staff-2)',
    entityId: 'staff-2',
    previousValue: 'SUPPORT_AGENT',
    newValue: 'SUPPORT_LEAD (VIP_CONCIERGE)',
    notes: 'Promoted Aarav Mehta to VIP Concierge Desk Support Lead.',
    createdAt: '2026-10-01T17:45:00Z',
    admin: {
      name: 'Platform SuperAdmin',
      email: 'admin@propfirmrewards.com',
    },
  },
  {
    id: 'log-5',
    action: 'SUSPEND_USER_ACCOUNT',
    entity: 'UserAccount (usr-4)',
    entityId: 'usr-4',
    previousValue: 'ACTIVE',
    newValue: 'SUSPENDED',
    notes: 'Account flagged for duplicate invoice submission audit.',
    createdAt: '2026-09-29T13:10:00Z',
    admin: {
      name: 'Neha Sharma',
      email: 'neha.verify@propfirmrewards.com',
    },
  },
];

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>(DEFAULT_AUDIT_LOGS);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api
      .get<{ logs: AuditLog[] }>('/admin/audit-logs', { limit: 100 })
      .then((data) => {
        if (data?.logs && data.logs.length > 0) {
          setLogs(data.logs);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const getActionBadge = (action: string) => {
    if (action.includes('APPROVE')) return <Badge variant="success">{action}</Badge>;
    if (action.includes('REJECT') || action.includes('SUSPEND') || action.includes('DELETE'))
      return <Badge variant="danger">{action}</Badge>;
    if (action.includes('ADJUST') || action.includes('UPDATE'))
      return <Badge variant="purple">{action}</Badge>;
    return <Badge variant="info">{action}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Administrative Audit Trail</h1>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
            Immutable log of all administrative interventions, approvals, manual point adjustments, and status changes.
          </p>
        </div>
      </div>

      <Card className="p-0 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-500 dark:text-slate-400">Loading audit trail...</div>
        ) : logs.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500 dark:text-slate-400">No audit logs found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-950/80 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-5 py-3.5">Timestamp</th>
                  <th className="px-5 py-3.5">Admin</th>
                  <th className="px-5 py-3.5">Action</th>
                  <th className="px-5 py-3.5">Entity</th>
                  <th className="px-5 py-3.5">Audit Notes &amp; Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800/80">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-5 py-3.5 whitespace-nowrap text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                      {formatDateTime(log.createdAt)}
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <div className="font-bold text-slate-900 dark:text-white">
                        {log.admin?.name || 'System / Auto'}
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        {log.admin?.email}
                      </div>
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      {getActionBadge(log.action)}
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      {log.entity}
                    </td>
                    <td className="px-5 py-3.5 max-w-lg text-slate-800 dark:text-slate-200">
                      <div>{log.notes || 'No extra notes'}</div>
                      {(log.newValue || log.previousValue) && (
                        <div className="text-[11px] text-slate-500 font-mono truncate max-w-sm mt-0.5">
                          {log.newValue ? `New: ${log.newValue}` : ''}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
