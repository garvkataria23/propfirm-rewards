'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/auth-context';
import { api } from '@/lib/api';
import {
  ShieldCheck,
  UserCheck,
  ShieldAlert,
  UserPlus,
  Edit2,
  Lock,
  CheckCircle2,
  AlertCircle,
  Search,
  Key,
  Layers,
  Users,
  Clock,
  Sparkles,
  Award,
} from 'lucide-react';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  department?: string;
  permissions?: string[];
  avatarUrl?: string;
  phone?: string;
  country?: string;
  createdAt: string;
  _count?: {
    assignedTickets: number;
  };
}

export default function AdminTeamManagementPage() {
  const { user } = useAuth();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [editRole, setEditRole] = useState<string>('SUPPORT_AGENT');
  const [editDept, setEditDept] = useState<string>('VERIFICATION');
  const [editPermissions, setEditPermissions] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const availableRoles = [
    { value: 'SUPER_ADMIN', label: 'Super Admin', desc: 'Full platform authority & team management' },
    { value: 'ADMIN', label: 'Admin', desc: 'Manage operations, prop firms, rewards & payouts' },
    { value: 'SUPPORT_LEAD', label: 'Support Lead', desc: 'VIP concierge & escalations desk manager' },
    { value: 'SUPPORT_AGENT', label: 'Support Agent', desc: 'Chat support & verification review' },
    { value: 'FINANCE_OFFICER', label: 'Finance Officer', desc: 'Cashout approvals & ledger compliance' },
    { value: 'USER', label: 'Standard Trader', desc: 'Demote to regular platform user' },
  ];

  const availableDepartments = [
    { value: 'EXECUTIVE', label: 'Executive Operations' },
    { value: 'VIP_CONCIERGE', label: 'VIP Concierge Desk' },
    { value: 'VERIFICATION', label: 'Purchase Verification' },
    { value: 'PAYOUTS', label: 'Finance & Cashouts' },
    { value: 'GENERAL', label: 'General Help Desk' },
  ];

  const availablePermissions = [
    { key: 'assign_tickets', label: 'Assign & Reassign Support Chats', desc: 'Can distribute queue tickets across staff' },
    { key: 'resolve_tickets', label: 'Close & Resolve Tickets', desc: 'Can complete conversations and close threads' },
    { key: 'approve_purchases', label: 'Approve Invoices & Award Points', desc: 'Can verify proof screenshots & issue reward points' },
    { key: 'manage_payouts', label: 'Authorize Cashouts & Crypto Wire', desc: 'Can verify bank wires and crypto cashouts' },
    { key: 'manage_rewards', label: 'Manage Reward Catalog', desc: 'Can add/edit merchandise and stock limits' },
    { key: 'manage_team', label: 'Manage Staff Roles & Access', desc: 'Can promote/demote staff (Super Admin only)' },
    { key: 'view_audit_logs', label: 'View Security Audit Logs', desc: 'Can inspect staff action history' },
  ];

  const fetchTeam = async () => {
    try {
      setIsLoading(true);
      const res = await api.get<TeamMember[]>('/support/admin/team');
      setMembers(res || []);
    } catch (err) {
      console.error('Failed to load team:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTeam();
  }, []);

  const openEditModal = (member: TeamMember) => {
    setSelectedMember(member);
    setEditRole(member.role);
    setEditDept(member.department || 'GENERAL');
    setEditPermissions(member.permissions || []);
    setSuccessMsg(null);
    setErrorMsg(null);
  };

  const togglePermission = (key: string) => {
    if (editPermissions.includes(key)) {
      setEditPermissions(editPermissions.filter((p) => p !== key));
    } else {
      setEditPermissions([...editPermissions, key]);
    }
  };

  const handleSaveRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMember) return;

    setIsSaving(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    try {
      await api.patch(`/support/admin/team/${selectedMember.id}/role`, {
        role: editRole,
        department: editDept,
        permissions: editPermissions,
      });

      setSuccessMsg(`Role & permissions for ${selectedMember.name} updated successfully!`);
      setTimeout(() => {
        setSelectedMember(null);
        fetchTeam();
      }, 1200);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update user role');
    } finally {
      setIsSaving(false);
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return <Badge className="bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/30 font-bold">👑 Super Admin</Badge>;
      case 'ADMIN':
        return <Badge className="bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-500/30 font-bold">🛡️ Admin</Badge>;
      case 'SUPPORT_LEAD':
        return <Badge className="bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30 font-bold">⭐ Support Lead</Badge>;
      case 'SUPPORT_AGENT':
        return <Badge className="bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/30 font-bold">🎧 Support Agent</Badge>;
      case 'FINANCE_OFFICER':
        return <Badge className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 font-bold">💳 Finance Officer</Badge>;
      default:
        return <Badge className="bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-500/30">Trader</Badge>;
    }
  };

  const filteredMembers = members.filter((m) =>
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <ShieldCheck className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            Team & Role Delegation Management
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Superadmin role assignment console: assign staff duties, live chat delegation, and granular permission controls.
          </p>
        </div>
      </div>

      {/* Stats summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="p-4 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-xs">
          <p className="text-[11px] font-semibold text-slate-500">Total Staff Team</p>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{members.length}</p>
        </Card>
        <Card className="p-4 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-xs">
          <p className="text-[11px] font-semibold text-slate-500">Live Support Leads & Agents</p>
          <p className="text-2xl font-black text-purple-600 dark:text-purple-400 mt-1">
            {members.filter((m) => m.role.includes('SUPPORT')).length}
          </p>
        </Card>
        <Card className="p-4 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-xs">
          <p className="text-[11px] font-semibold text-slate-500">Finance & Compliance</p>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
            {members.filter((m) => m.role === 'FINANCE_OFFICER').length}
          </p>
        </Card>
        <Card className="p-4 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-xs">
          <p className="text-[11px] font-semibold text-slate-500">Executive Admins</p>
          <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-1">
            {members.filter((m) => m.role.includes('ADMIN')).length}
          </p>
        </Card>
      </div>

      {/* Staff Table */}
      <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search staff by name, email, or role..."
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-purple-500"
            />
          </div>
          <span className="text-xs text-slate-500">
            Click <strong>Manage Role</strong> to reassign duties or adjust permissions.
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-900/60 text-slate-500 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4 font-bold">Team Member</th>
                <th className="py-3 px-4 font-bold">Role & Authority</th>
                <th className="py-3 px-4 font-bold">Department</th>
                <th className="py-3 px-4 font-bold">Active Chats</th>
                <th className="py-3 px-4 font-bold">Granular Permissions</th>
                <th className="py-3 px-4 font-bold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-slate-400">Loading team...</td>
                </tr>
              ) : filteredMembers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-slate-400">No staff members found matching query.</td>
                </tr>
              ) : (
                filteredMembers.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="h-8 w-8 rounded-full bg-purple-500/20 text-purple-600 dark:text-purple-400 font-bold flex items-center justify-center shrink-0 border border-purple-500/30">
                          {m.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white">{m.name}</p>
                          <p className="text-[11px] text-slate-500">{m.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {getRoleBadge(m.role)}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-mono text-[11px] text-slate-700 dark:text-slate-300 uppercase">
                        {m.department || 'GENERAL'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-purple-600 dark:text-purple-400">
                        {m._count?.assignedTickets || 0} tickets
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1 max-w-[280px]">
                        {m.permissions && m.permissions.length > 0 ? (
                          m.permissions.slice(0, 3).map((p) => (
                            <span
                              key={p}
                              className="px-1.5 py-0.5 rounded text-[9px] bg-slate-100 dark:bg-slate-850 text-slate-600 dark:text-slate-400 font-mono"
                            >
                              {p}
                            </span>
                          ))
                        ) : (
                          <span className="text-[10px] text-slate-400 italic">Default role access</span>
                        )}
                        {m.permissions && m.permissions.length > 3 && (
                          <span className="text-[9px] text-purple-500 font-bold">
                            +{m.permissions.length - 3} more
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openEditModal(m)}
                        className="text-xs gap-1.5 cursor-pointer hover:border-purple-500"
                      >
                        <Edit2 className="h-3 w-3" />
                        Manage Role
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Role & Permissions Assignment Modal */}
      {selectedMember && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <Card className="w-full max-w-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-850 pb-4">
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Key className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                  Assign Role & Permissions
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Adjusting administrative authority for <strong>{selectedMember.name}</strong> ({selectedMember.email})
                </p>
              </div>
              <button
                onClick={() => setSelectedMember(null)}
                className="text-slate-400 hover:text-slate-600 text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            {successMsg && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                {successMsg}
              </div>
            )}

            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSaveRole} className="space-y-4 text-xs">
              {/* Select Role */}
              <div>
                <label className="font-bold text-slate-900 dark:text-white block mb-1.5">
                  Platform Authority Role:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {availableRoles.map((r) => (
                    <div
                      key={r.value}
                      onClick={() => setEditRole(r.value)}
                      className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                        editRole === r.value
                          ? 'border-purple-500 bg-purple-50/50 dark:bg-purple-950/20 shadow-xs'
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                      }`}
                    >
                      <p className="font-bold text-slate-900 dark:text-white">{r.label}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">{r.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Select Department */}
              <div>
                <label className="font-bold text-slate-900 dark:text-white block mb-1.5">
                  Assigned Operational Department:
                </label>
                <select
                  value={editDept}
                  onChange={(e) => setEditDept(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-semibold text-slate-900 dark:text-white focus:outline-none"
                >
                  {availableDepartments.map((d) => (
                    <option key={d.value} value={d.value}>
                      {d.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Granular Permission Toggles */}
              <div>
                <label className="font-bold text-slate-900 dark:text-white block mb-1.5">
                  Granular Operational Permissions:
                </label>
                <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
                  {availablePermissions.map((p) => {
                    const isChecked = editPermissions.includes(p.key);
                    return (
                      <div
                        key={p.key}
                        onClick={() => togglePermission(p.key)}
                        className={`p-2 rounded-lg border flex items-center justify-between transition-all cursor-pointer ${
                          isChecked
                            ? 'border-purple-500/50 bg-purple-500/5 text-purple-900 dark:text-purple-200'
                            : 'border-slate-200 dark:border-slate-850 hover:bg-slate-50 dark:hover:bg-slate-900'
                        }`}
                      >
                        <div>
                          <p className="font-bold text-[11px] text-slate-900 dark:text-white">{p.label}</p>
                          <p className="text-[10px] text-slate-500">{p.desc}</p>
                        </div>
                        <div
                          className={`h-4 w-4 rounded flex items-center justify-center border text-[10px] font-bold ${
                            isChecked
                              ? 'bg-purple-600 border-purple-600 text-white'
                              : 'border-slate-300 dark:border-slate-700'
                          }`}
                        >
                          {isChecked && '✓'}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Footer Buttons */}
              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-850">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedMember(null)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={isSaving}
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                >
                  {isSaving ? 'Updating...' : 'Save Role & Permissions'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
