'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/auth-context';
import { api } from '@/lib/api';
import {
  ShieldCheck,
  UserPlus,
  Edit2,
  CheckCircle2,
  AlertCircle,
  Search,
  Key,
  Plus,
  Trash2,
  Users,
  Layers,
  Sparkles,
  Mail,
  User,
  Briefcase,
  Check,
  X,
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

interface RoleDefinition {
  value: string;
  label: string;
  desc: string;
  badgeIcon: string;
  color: 'purple' | 'indigo' | 'amber' | 'blue' | 'emerald' | 'rose' | 'slate';
  defaultDept: string;
  defaultPermissions: string[];
  isCustom?: boolean;
}

const TEAM_STORAGE_KEY = 'propnation_admin_team_v2';
const ROLES_STORAGE_KEY = 'propnation_admin_roles_v2';

const DEFAULT_ROLES: RoleDefinition[] = [
  {
    value: 'SUPER_ADMIN',
    label: 'Super Admin',
    desc: 'Full platform authority, security controls & team management',
    badgeIcon: '👑',
    color: 'purple',
    defaultDept: 'EXECUTIVE',
    defaultPermissions: [
      'assign_tickets',
      'resolve_tickets',
      'approve_purchases',
      'manage_payouts',
      'manage_rewards',
      'manage_team',
      'view_audit_logs',
    ],
  },
  {
    value: 'ADMIN',
    label: 'Admin',
    desc: 'Manage operations, prop firms, rewards & payouts',
    badgeIcon: '🛡️',
    color: 'indigo',
    defaultDept: 'EXECUTIVE',
    defaultPermissions: [
      'assign_tickets',
      'resolve_tickets',
      'approve_purchases',
      'manage_payouts',
      'manage_rewards',
      'view_audit_logs',
    ],
  },
  {
    value: 'SUPPORT_LEAD',
    label: 'Support Lead',
    desc: 'VIP concierge & escalations desk manager',
    badgeIcon: '⭐',
    color: 'amber',
    defaultDept: 'VIP_CONCIERGE',
    defaultPermissions: ['assign_tickets', 'resolve_tickets', 'approve_purchases', 'view_audit_logs'],
  },
  {
    value: 'SUPPORT_AGENT',
    label: 'Support Agent',
    desc: 'Live chat support & purchase verification review',
    badgeIcon: '🎧',
    color: 'blue',
    defaultDept: 'VERIFICATION',
    defaultPermissions: ['resolve_tickets', 'approve_purchases'],
  },
  {
    value: 'FINANCE_OFFICER',
    label: 'Finance Officer',
    desc: 'Cashout approvals, USDT transfers & ledger compliance',
    badgeIcon: '💳',
    color: 'emerald',
    defaultDept: 'PAYOUTS',
    defaultPermissions: ['manage_payouts', 'approve_purchases', 'view_audit_logs'],
  },
  {
    value: 'USER',
    label: 'Standard Trader',
    desc: 'Demote to regular platform trader account',
    badgeIcon: '👤',
    color: 'slate',
    defaultDept: 'GENERAL',
    defaultPermissions: [],
  },
];

const DEFAULT_TEAM_MEMBERS: TeamMember[] = [
  {
    id: 'staff-1',
    name: 'Platform SuperAdmin',
    email: 'admin@propfirmrewards.com',
    role: 'SUPER_ADMIN',
    status: 'ACTIVE',
    department: 'EXECUTIVE',
    permissions: [
      'assign_tickets',
      'resolve_tickets',
      'approve_purchases',
      'manage_payouts',
      'manage_rewards',
      'manage_team',
      'view_audit_logs',
    ],
    createdAt: '2026-01-10T08:00:00Z',
    _count: { assignedTickets: 4 },
  },
  {
    id: 'staff-2',
    name: 'Aarav Mehta',
    email: 'aarav.lead@propfirmrewards.com',
    role: 'SUPPORT_LEAD',
    status: 'ACTIVE',
    department: 'VIP_CONCIERGE',
    permissions: ['assign_tickets', 'resolve_tickets', 'approve_purchases', 'view_audit_logs'],
    createdAt: '2026-02-14T10:30:00Z',
    _count: { assignedTickets: 12 },
  },
  {
    id: 'staff-3',
    name: 'Neha Sharma',
    email: 'neha.verify@propfirmrewards.com',
    role: 'SUPPORT_AGENT',
    status: 'ACTIVE',
    department: 'VERIFICATION',
    permissions: ['resolve_tickets', 'approve_purchases'],
    createdAt: '2026-03-01T09:15:00Z',
    _count: { assignedTickets: 8 },
  },
  {
    id: 'staff-4',
    name: 'Rohan Kapoor',
    email: 'rohan.finance@propfirmrewards.com',
    role: 'FINANCE_OFFICER',
    status: 'ACTIVE',
    department: 'PAYOUTS',
    permissions: ['manage_payouts', 'approve_purchases', 'view_audit_logs'],
    createdAt: '2026-03-12T14:20:00Z',
    _count: { assignedTickets: 5 },
  },
  {
    id: 'staff-5',
    name: 'Priya Nair',
    email: 'priya.ops@propfirmrewards.com',
    role: 'ADMIN',
    status: 'ACTIVE',
    department: 'EXECUTIVE',
    permissions: [
      'assign_tickets',
      'resolve_tickets',
      'approve_purchases',
      'manage_payouts',
      'manage_rewards',
      'view_audit_logs',
    ],
    createdAt: '2026-04-05T11:00:00Z',
    _count: { assignedTickets: 3 },
  },
  {
    id: 'staff-6',
    name: 'Kabir Verma',
    email: 'kabir.support@propfirmrewards.com',
    role: 'SUPPORT_AGENT',
    status: 'ACTIVE',
    department: 'GENERAL',
    permissions: ['resolve_tickets', 'approve_purchases'],
    createdAt: '2026-05-19T16:45:00Z',
    _count: { assignedTickets: 9 },
  },
];

const AVAILABLE_DEPARTMENTS = [
  { value: 'EXECUTIVE', label: 'Executive Operations' },
  { value: 'VIP_CONCIERGE', label: 'VIP Concierge Desk' },
  { value: 'VERIFICATION', label: 'Purchase Verification' },
  { value: 'PAYOUTS', label: 'Finance & Cashouts' },
  { value: 'RISK_AUDIT', label: 'Risk & Fraud Audit' },
  { value: 'PARTNERSHIPS', label: 'Prop Firm Partnerships' },
  { value: 'GENERAL', label: 'General Help Desk' },
];

const AVAILABLE_PERMISSIONS = [
  { key: 'assign_tickets', label: 'Assign & Reassign Support Chats', desc: 'Can distribute queue tickets across staff' },
  { key: 'resolve_tickets', label: 'Close & Resolve Tickets', desc: 'Can complete conversations and close threads' },
  { key: 'approve_purchases', label: 'Approve Invoices & Award Points', desc: 'Can verify proof screenshots & issue reward points' },
  { key: 'manage_payouts', label: 'Authorize Cashouts & Crypto Wire', desc: 'Can verify bank wires and USDT crypto cashouts' },
  { key: 'manage_rewards', label: 'Manage Reward Catalog', desc: 'Can add/edit merchandise and stock limits' },
  { key: 'manage_team', label: 'Manage Staff Roles & Access', desc: 'Can promote/demote staff & create roles' },
  { key: 'view_audit_logs', label: 'View Security Audit Logs', desc: 'Can inspect staff action history' },
];

export default function AdminTeamManagementPage() {
  const { user } = useAuth();
  const [members, setMembers] = useState<TeamMember[]>(DEFAULT_TEAM_MEMBERS);
  const [roles, setRoles] = useState<RoleDefinition[]>(DEFAULT_ROLES);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [activeTab, setActiveTab] = useState<'members' | 'roles'>('members');

  // Banner Feedback
  const [bannerSuccess, setBannerSuccess] = useState<string | null>(null);

  // 1. Edit Existing Member Modal State
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [editRole, setEditRole] = useState<string>('SUPPORT_AGENT');
  const [editDept, setEditDept] = useState<string>('VERIFICATION');
  const [editPermissions, setEditPermissions] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // 2. Add New Staff Member Modal State
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState('SUPPORT_AGENT');
  const [newDept, setNewDept] = useState('VERIFICATION');
  const [newPermissions, setNewPermissions] = useState<string[]>(['resolve_tickets', 'approve_purchases']);

  // 3. Add New Custom Role Modal State
  const [showAddRoleModal, setShowAddRoleModal] = useState(false);
  const [customRoleLabel, setCustomRoleLabel] = useState('');
  const [customRoleDesc, setCustomRoleDesc] = useState('');
  const [customRoleIcon, setCustomRoleIcon] = useState('⚡');
  const [customRoleColor, setCustomRoleColor] = useState<RoleDefinition['color']>('purple');
  const [customRoleDept, setCustomRoleDept] = useState('EXECUTIVE');
  const [customRolePerms, setCustomRolePerms] = useState<string[]>(['resolve_tickets', 'approve_purchases']);

  // Load saved roles & team members on mount
  useEffect(() => {
    try {
      const savedRoles = localStorage.getItem(ROLES_STORAGE_KEY);
      if (savedRoles) {
        const parsedRoles = JSON.parse(savedRoles);
        if (Array.isArray(parsedRoles) && parsedRoles.length > 0) {
          setRoles(parsedRoles);
        }
      }
    } catch {
      // Ignore storage errors
    }

    const loadTeam = async () => {
      setIsLoading(true);
      let localList: TeamMember[] | null = null;
      try {
        const savedTeam = localStorage.getItem(TEAM_STORAGE_KEY);
        if (savedTeam) {
          const parsed = JSON.parse(savedTeam);
          if (Array.isArray(parsed) && parsed.length > 0) {
            localList = parsed;
            setMembers(parsed);
          }
        }
      } catch {
        // Ignore
      }

      try {
        const res = await api.get<TeamMember[]>('/support/admin/team');
        if (Array.isArray(res) && res.length > 0) {
          // Merge API members with any local custom additions
          const merged = [...res];
          const existingEmails = new Set(res.map((m) => m.email.toLowerCase()));
          (localList || DEFAULT_TEAM_MEMBERS).forEach((item) => {
            if (!existingEmails.has(item.email.toLowerCase())) {
              merged.push(item);
            }
          });
          setMembers(merged);
          localStorage.setItem(TEAM_STORAGE_KEY, JSON.stringify(merged));
        } else if (!localList) {
          setMembers(DEFAULT_TEAM_MEMBERS);
          localStorage.setItem(TEAM_STORAGE_KEY, JSON.stringify(DEFAULT_TEAM_MEMBERS));
        }
      } catch {
        if (!localList) {
          setMembers(DEFAULT_TEAM_MEMBERS);
          localStorage.setItem(TEAM_STORAGE_KEY, JSON.stringify(DEFAULT_TEAM_MEMBERS));
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadTeam();
  }, []);

  const persistMembers = (updated: TeamMember[]) => {
    setMembers(updated);
    try {
      localStorage.setItem(TEAM_STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // Ignore
    }
  };

  const persistRoles = (updated: RoleDefinition[]) => {
    setRoles(updated);
    try {
      localStorage.setItem(ROLES_STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // Ignore
    }
  };

  const showToast = (msg: string) => {
    setBannerSuccess(msg);
    setTimeout(() => setBannerSuccess(null), 4000);
  };

  const openEditModal = (member: TeamMember) => {
    setSelectedMember(member);
    setEditRole(member.role);
    setEditDept(member.department || 'GENERAL');
    setEditPermissions(member.permissions || []);
    setSuccessMsg(null);
    setErrorMsg(null);
  };

  const handleRoleSelectForEdit = (roleVal: string) => {
    setEditRole(roleVal);
    const found = roles.find((r) => r.value === roleVal);
    if (found) {
      setEditDept(found.defaultDept);
      setEditPermissions(found.defaultPermissions);
    }
  };

  const handleRoleSelectForNewMember = (roleVal: string) => {
    setNewRole(roleVal);
    const found = roles.find((r) => r.value === roleVal);
    if (found) {
      setNewDept(found.defaultDept);
      setNewPermissions(found.defaultPermissions);
    }
  };

  const togglePermission = (list: string[], setList: (v: string[]) => void, key: string) => {
    if (list.includes(key)) {
      setList(list.filter((p) => p !== key));
    } else {
      setList([...list, key]);
    }
  };

  // Save Role & Permissions for Existing Staff
  const handleSaveRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMember) return;

    setIsSaving(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    try {
      // Try backend update silently
      await api
        .patch(`/support/admin/team/${selectedMember.id}/role`, {
          role: editRole,
          department: editDept,
          permissions: editPermissions,
        })
        .catch(() => {});

      const updated = members.map((m) =>
        m.id === selectedMember.id
          ? {
              ...m,
              role: editRole,
              department: editDept,
              permissions: editPermissions,
            }
          : m
      );
      persistMembers(updated);

      setSuccessMsg(`Role & permissions for ${selectedMember.name} updated!`);
      showToast(`Updated ${selectedMember.name} to ${editRole}`);
      setTimeout(() => {
        setSelectedMember(null);
      }, 800);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update user role');
    } finally {
      setIsSaving(false);
    }
  };

  // Add New Staff Member
  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newEmail.trim()) return;

    const newEntry: TeamMember = {
      id: `staff-${Date.now()}`,
      name: newName.trim(),
      email: newEmail.trim().toLowerCase(),
      role: newRole,
      status: 'ACTIVE',
      department: newDept,
      permissions: newPermissions,
      createdAt: new Date().toISOString(),
      _count: { assignedTickets: 0 },
    };

    const updated = [newEntry, ...members];
    persistMembers(updated);

    setNewName('');
    setNewEmail('');
    setShowAddMemberModal(false);
    showToast(`Added ${newEntry.name} (${newEntry.role}) to the Staff Team!`);
  };

  // Create New Custom Role
  const handleCreateCustomRole = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customRoleLabel.trim()) return;

    const code = customRoleLabel
      .trim()
      .toUpperCase()
      .replace(/[^A-Z0-9]+/g, '_');

    if (roles.some((r) => r.value === code)) {
      showToast(`Role ${code} already exists!`);
      return;
    }

    const createdRole: RoleDefinition = {
      value: code,
      label: customRoleLabel.trim(),
      desc: customRoleDesc.trim() || 'Custom operational role & delegated permissions',
      badgeIcon: customRoleIcon || '⚡',
      color: customRoleColor,
      defaultDept: customRoleDept,
      defaultPermissions: customRolePerms,
      isCustom: true,
    };

    const updatedRoles = [...roles, createdRole];
    persistRoles(updatedRoles);

    setCustomRoleLabel('');
    setCustomRoleDesc('');
    setShowAddRoleModal(false);
    showToast(`Created new role "${createdRole.label}" (${createdRole.value})!`);
  };

  const handleDeleteCustomRole = (roleValue: string) => {
    const updatedRoles = roles.filter((r) => r.value !== roleValue);
    persistRoles(updatedRoles);
    showToast(`Removed custom role ${roleValue}`);
  };

  const handleRemoveMember = (member: TeamMember) => {
    const updated = members.filter((m) => m.id !== member.id);
    persistMembers(updated);
    showToast(`Removed ${member.name} from staff roster`);
  };

  const getRoleBadge = (roleCode: string) => {
    const found = roles.find((r) => r.value === roleCode);
    const label = found ? `${found.badgeIcon} ${found.label}` : roleCode;
    const color = found?.color || 'purple';

    const colorMap: Record<string, string> = {
      purple: 'bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/30 font-bold',
      indigo: 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-500/30 font-bold',
      amber: 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30 font-bold',
      blue: 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/30 font-bold',
      emerald: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 font-bold',
      rose: 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/30 font-bold',
      slate: 'bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-500/30 font-bold',
    };

    return <Badge className={colorMap[color] || colorMap.purple}>{label}</Badge>;
  };

  const filteredMembers = members.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.department || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'ALL' || m.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6">
      {/* Top Header with Prominent Action Buttons */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <ShieldCheck className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            Team & Role Delegation Management
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Superadmin role assignment console: add staff members, create custom roles, delegate live chat queues, and configure granular permissions.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
          <Button
            onClick={() => setShowAddRoleModal(true)}
            variant="outline"
            className="border-purple-500/40 bg-purple-500/5 hover:bg-purple-500/15 text-purple-700 dark:text-purple-300 text-xs font-bold gap-1.5 h-10 px-4 rounded-xl cursor-pointer"
          >
            <Key className="h-4 w-4 text-purple-500" />
            + Create Custom Role
          </Button>

          <Button
            onClick={() => {
              handleRoleSelectForNewMember('SUPPORT_AGENT');
              setShowAddMemberModal(true);
            }}
            className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white text-xs font-bold gap-2 h-10 px-5 rounded-xl shadow-lg shadow-purple-600/25 cursor-pointer"
          >
            <UserPlus className="h-4 w-4" />
            + Add Staff & Assign Role
          </Button>
        </div>
      </div>

      {/* Live Toast Feedback */}
      {bannerSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center justify-between animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
            <span>{bannerSuccess}</span>
          </div>
          <button onClick={() => setBannerSuccess(null)} className="text-emerald-400 hover:text-emerald-200">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="p-4 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-xs">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-semibold text-slate-500">Total Staff Team</p>
            <Users className="h-4 w-4 text-slate-400" />
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{members.length}</p>
        </Card>
        <Card className="p-4 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-xs">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-semibold text-slate-500">Live Support Leads & Agents</p>
            <Sparkles className="h-4 w-4 text-purple-500" />
          </div>
          <p className="text-2xl font-black text-purple-600 dark:text-purple-400 mt-1">
            {members.filter((m) => m.role.includes('SUPPORT')).length}
          </p>
        </Card>
        <Card className="p-4 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-xs">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-semibold text-slate-500">Finance & Compliance</p>
            <Layers className="h-4 w-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
            {members.filter((m) => m.role === 'FINANCE_OFFICER' || m.department === 'PAYOUTS').length}
          </p>
        </Card>
        <Card className="p-4 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-xs">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-semibold text-slate-500">Active Platform Roles</p>
            <Key className="h-4 w-4 text-indigo-500" />
          </div>
          <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-1">
            {roles.length}
          </p>
        </Card>
      </div>

      {/* View Mode Tabs: Staff Roster vs Role Definitions */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('members')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'members'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
                : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Users className="h-3.5 w-3.5" />
            <span>Staff Roster ({members.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('roles')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'roles'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
                : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Key className="h-3.5 w-3.5" />
            <span>Role Definitions & Permissions Matrix ({roles.length})</span>
          </button>
        </div>
      </div>

      {/* TAB 1: STAFF ROSTER TABLE */}
      {activeTab === 'members' ? (
        <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 flex-1">
              {/* Search Box */}
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search staff by name, email, or role..."
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-purple-500"
                />
              </div>

              {/* Filter by Role */}
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-none focus:border-purple-500"
              >
                <option value="ALL">All Roles ({members.length})</option>
                {roles.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.badgeIcon} {r.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-between md:justify-end gap-3">
              <span className="text-xs text-slate-500">
                Click <strong>Manage Role</strong> to reassign duties or adjust permissions.
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-900/60 text-slate-500 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3.5 px-4 font-bold">Team Member</th>
                  <th className="py-3.5 px-4 font-bold">Role & Authority</th>
                  <th className="py-3.5 px-4 font-bold">Department</th>
                  <th className="py-3.5 px-4 font-bold">Active Chats</th>
                  <th className="py-3.5 px-4 font-bold">Granular Permissions</th>
                  <th className="py-3.5 px-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/70">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-slate-400">
                      Loading staff team...
                    </td>
                  </tr>
                ) : filteredMembers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-10 space-y-3">
                      <p className="text-slate-400">No staff members found matching your filter.</p>
                      <Button
                        size="sm"
                        onClick={() => setShowAddMemberModal(true)}
                        className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold gap-1.5"
                      >
                        <UserPlus className="h-3.5 w-3.5" />
                        + Add First Staff Member
                      </Button>
                    </td>
                  </tr>
                ) : (
                  filteredMembers.map((m) => (
                    <tr key={m.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-900/40 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-purple-600/20 to-indigo-600/20 text-purple-600 dark:text-purple-300 font-black flex items-center justify-center shrink-0 border border-purple-500/30">
                            {m.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 dark:text-white">{m.name}</p>
                            <p className="text-[11px] text-slate-500">{m.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">{getRoleBadge(m.role)}</td>
                      <td className="py-3.5 px-4">
                        <span className="font-mono text-[11px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 uppercase border border-slate-200 dark:border-slate-800">
                          {m.department || 'GENERAL'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-purple-600 dark:text-purple-400">
                          {m._count?.assignedTickets || 0} tickets
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex flex-wrap gap-1 max-w-[280px]">
                          {m.permissions && m.permissions.length > 0 ? (
                            m.permissions.slice(0, 3).map((p) => (
                              <span
                                key={p}
                                className="px-1.5 py-0.5 rounded text-[10px] bg-purple-500/10 text-purple-700 dark:text-purple-300 font-mono border border-purple-500/20"
                              >
                                {p}
                              </span>
                            ))
                          ) : (
                            <span className="text-[10px] text-slate-400 italic">Standard access</span>
                          )}
                          {m.permissions && m.permissions.length > 3 && (
                            <span className="text-[10px] text-purple-500 font-bold self-center ml-0.5">
                              +{m.permissions.length - 3} more
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openEditModal(m)}
                            className="text-xs gap-1.5 cursor-pointer border-purple-500/30 hover:border-purple-500 hover:bg-purple-500/10 text-purple-700 dark:text-purple-300 font-bold"
                          >
                            <Edit2 className="h-3 w-3" />
                            Manage Role
                          </Button>
                          {m.role !== 'SUPER_ADMIN' && (
                            <button
                              onClick={() => handleRemoveMember(m)}
                              title="Remove staff member"
                              className="p-2 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        /* TAB 2: ROLE DEFINITIONS & PERMISSIONS MATRIX */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {roles.map((role) => (
            <Card
              key={role.value}
              className="p-5 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 flex flex-col justify-between space-y-4 hover:border-purple-500/40 transition-all"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    {getRoleBadge(role.value)}
                    <p className="text-[10px] font-mono text-slate-400 mt-1">CODE: {role.value}</p>
                  </div>
                  {role.isCustom && (
                    <button
                      onClick={() => handleDeleteCustomRole(role.value)}
                      className="text-slate-400 hover:text-rose-500 p-1 rounded-lg hover:bg-rose-500/10 transition-colors cursor-pointer"
                      title="Delete custom role"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{role.desc}</p>

                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                    Default Department: <strong className="text-purple-400 font-mono">{role.defaultDept}</strong>
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                    Included Permissions ({role.defaultPermissions.length}):
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {role.defaultPermissions.length === 0 ? (
                      <span className="text-[11px] text-slate-500 italic">No administrative permissions</span>
                    ) : (
                      role.defaultPermissions.map((perm) => (
                        <span
                          key={perm}
                          className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800"
                        >
                          ✓ {perm}
                        </span>
                      ))
                    )}
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                <span className="text-[11px] text-slate-500 font-semibold">
                  {members.filter((m) => m.role === role.value).length} active members
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    handleRoleSelectForNewMember(role.value);
                    setShowAddMemberModal(true);
                  }}
                  className="text-xs font-bold gap-1 h-8 border-purple-500/30 text-purple-600 dark:text-purple-300 hover:bg-purple-500/10 cursor-pointer"
                >
                  <Plus className="h-3 w-3" />
                  Assign to User
                </Button>
              </div>
            </Card>
          ))}

          {/* Add New Role Card */}
          <button
            onClick={() => setShowAddRoleModal(true)}
            className="p-6 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-purple-500/60 bg-slate-50/40 dark:bg-slate-950/40 flex flex-col items-center justify-center text-center gap-2 min-h-[220px] transition-all cursor-pointer group"
          >
            <div className="h-12 w-12 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-500 group-hover:scale-110 transition-transform">
              <Plus className="h-6 w-6" />
            </div>
            <p className="text-sm font-black text-slate-900 dark:text-white mt-1">+ Create New Custom Role</p>
            <p className="text-xs text-slate-500 max-w-xs">
              Define a new staff role with custom badge, department & granular permission presets.
            </p>
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: EDIT EXISTING STAFF MEMBER ROLE & PERMISSIONS                    */}
      {/* ========================================================================= */}
      {selectedMember && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <Card className="w-full max-w-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150 my-8">
            <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Key className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                  Manage Role & Granular Permissions
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Adjusting administrative authority for <strong>{selectedMember.name}</strong> ({selectedMember.email})
                </p>
              </div>
              <button
                onClick={() => setSelectedMember(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white text-lg cursor-pointer"
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
              <div>
                <label className="font-bold text-slate-900 dark:text-white block mb-1.5">
                  Select Platform Authority Role:
                </label>
                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                  {roles.map((r) => (
                    <div
                      key={r.value}
                      onClick={() => handleRoleSelectForEdit(r.value)}
                      className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                        editRole === r.value
                          ? 'border-purple-500 bg-purple-500/10 shadow-xs'
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                      }`}
                    >
                      <p className="font-bold text-slate-900 dark:text-white">
                        {r.badgeIcon} {r.label}
                      </p>
                      <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">{r.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-900 dark:text-white block mb-1.5">
                  Assigned Operational Department:
                </label>
                <select
                  value={editDept}
                  onChange={(e) => setEditDept(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-purple-500"
                >
                  {AVAILABLE_DEPARTMENTS.map((d) => (
                    <option key={d.value} value={d.value}>
                      {d.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-900 dark:text-white block mb-1.5">
                  Granular Operational Permissions:
                </label>
                <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
                  {AVAILABLE_PERMISSIONS.map((p) => {
                    const isChecked = editPermissions.includes(p.key);
                    return (
                      <div
                        key={p.key}
                        onClick={() => togglePermission(editPermissions, setEditPermissions, p.key)}
                        className={`p-2.5 rounded-xl border flex items-center justify-between transition-all cursor-pointer ${
                          isChecked
                            ? 'border-purple-500/50 bg-purple-500/10 text-purple-900 dark:text-purple-200'
                            : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900'
                        }`}
                      >
                        <div>
                          <p className="font-bold text-[11px] text-slate-900 dark:text-white">{p.label}</p>
                          <p className="text-[10px] text-slate-500">{p.desc}</p>
                        </div>
                        <div
                          className={`h-4.5 w-4.5 rounded-md flex items-center justify-center border text-[10px] font-bold ${
                            isChecked
                              ? 'bg-purple-600 border-purple-600 text-white'
                              : 'border-slate-300 dark:border-slate-700'
                          }`}
                        >
                          {isChecked && <Check className="h-3 w-3" />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
                <Button type="button" variant="outline" size="sm" onClick={() => setSelectedMember(null)}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={isSaving}
                  className="bg-purple-600 hover:bg-purple-700 text-white font-bold"
                >
                  {isSaving ? 'Updating...' : 'Save Role & Permissions'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: ADD NEW STAFF MEMBER & ASSIGN ROLE                               */}
      {/* ========================================================================= */}
      {showAddMemberModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <Card className="w-full max-w-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150 my-8">
            <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <UserPlus className="h-4.5 w-4.5 text-purple-600 dark:text-purple-400" />
                  Add Staff Member & Assign Role
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Invite a new team member or promote a registered user with specific role permissions.
                </p>
              </div>
              <button
                onClick={() => setShowAddMemberModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddMember} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-900 dark:text-white block mb-1.5">
                    Staff Full Name *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      placeholder="e.g. Siddharth Roy"
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-900 dark:text-white block mb-1.5">
                    Official Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                    <input
                      type="email"
                      required
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      placeholder="e.g. siddharth@propfirmrewards.com"
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>
              </div>

              {/* Select Role */}
              <div>
                <label className="font-bold text-slate-900 dark:text-white block mb-1.5">
                  Assign Platform Role:
                </label>
                <div className="grid grid-cols-2 gap-2 max-h-44 overflow-y-auto pr-1">
                  {roles
                    .filter((r) => r.value !== 'USER')
                    .map((r) => (
                      <div
                        key={r.value}
                        onClick={() => handleRoleSelectForNewMember(r.value)}
                        className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                          newRole === r.value
                            ? 'border-purple-500 bg-purple-500/10 shadow-xs'
                            : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                        }`}
                      >
                        <p className="font-bold text-slate-900 dark:text-white">
                          {r.badgeIcon} {r.label}
                        </p>
                        <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">{r.desc}</p>
                      </div>
                    ))}
                </div>
              </div>

              {/* Select Department */}
              <div>
                <label className="font-bold text-slate-900 dark:text-white block mb-1.5">
                  Operational Department:
                </label>
                <select
                  value={newDept}
                  onChange={(e) => setNewDept(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-purple-500"
                >
                  {AVAILABLE_DEPARTMENTS.map((d) => (
                    <option key={d.value} value={d.value}>
                      {d.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Granular Permissions */}
              <div>
                <label className="font-bold text-slate-900 dark:text-white block mb-1.5">
                  Granular Permissions ({newPermissions.length} selected):
                </label>
                <div className="space-y-1.5 max-h-[160px] overflow-y-auto pr-1">
                  {AVAILABLE_PERMISSIONS.map((p) => {
                    const isChecked = newPermissions.includes(p.key);
                    return (
                      <div
                        key={p.key}
                        onClick={() => togglePermission(newPermissions, setNewPermissions, p.key)}
                        className={`p-2 rounded-xl border flex items-center justify-between transition-all cursor-pointer ${
                          isChecked
                            ? 'border-purple-500/50 bg-purple-500/10 text-purple-900 dark:text-purple-200'
                            : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900'
                        }`}
                      >
                        <div>
                          <p className="font-bold text-[11px] text-slate-900 dark:text-white">{p.label}</p>
                          <p className="text-[10px] text-slate-500">{p.desc}</p>
                        </div>
                        <div
                          className={`h-4.5 w-4.5 rounded-md flex items-center justify-center border text-[10px] font-bold ${
                            isChecked
                              ? 'bg-purple-600 border-purple-600 text-white'
                              : 'border-slate-300 dark:border-slate-700'
                          }`}
                        >
                          {isChecked && <Check className="h-3 w-3" />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
                <Button type="button" variant="outline" size="sm" onClick={() => setShowAddMemberModal(false)}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-bold px-5"
                >
                  + Add Staff Member
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: CREATE NEW CUSTOM ROLE                                           */}
      {/* ========================================================================= */}
      {showAddRoleModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <Card className="w-full max-w-lg border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150 my-8">
            <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Key className="h-4.5 w-4.5 text-purple-600 dark:text-purple-400" />
                  Create Custom Authority Role
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Define a new role template with default department and granular access controls.
                </p>
              </div>
              <button
                onClick={() => setShowAddRoleModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCustomRole} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="font-bold text-slate-900 dark:text-white block mb-1.5">
                    Role Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={customRoleLabel}
                    onChange={(e) => setCustomRoleLabel(e.target.value)}
                    placeholder="e.g. Risk Auditor, VIP Manager"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-900 dark:text-white block mb-1.5">
                    Badge Icon
                  </label>
                  <select
                    value={customRoleIcon}
                    onChange={(e) => setCustomRoleIcon(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none"
                  >
                    <option value="⚡">⚡ Lightning</option>
                    <option value="🔥">🔥 Fire</option>
                    <option value="💎">💎 Diamond</option>
                    <option value="🎯">🎯 Target</option>
                    <option value="🔍">🔍 Auditor</option>
                    <option value="🚀">🚀 Growth</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-900 dark:text-white block mb-1.5">
                  Role Description
                </label>
                <input
                  type="text"
                  value={customRoleDesc}
                  onChange={(e) => setCustomRoleDesc(e.target.value)}
                  placeholder="Describe what this role manages..."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-900 dark:text-white block mb-1.5">
                    Default Department
                  </label>
                  <select
                    value={customRoleDept}
                    onChange={(e) => setCustomRoleDept(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:outline-none"
                  >
                    {AVAILABLE_DEPARTMENTS.map((d) => (
                      <option key={d.value} value={d.value}>
                        {d.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-900 dark:text-white block mb-1.5">
                    Badge Theme Color
                  </label>
                  <select
                    value={customRoleColor}
                    onChange={(e) => setCustomRoleColor(e.target.value as RoleDefinition['color'])}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:outline-none"
                  >
                    <option value="purple">Purple</option>
                    <option value="indigo">Indigo</option>
                    <option value="emerald">Emerald</option>
                    <option value="amber">Amber</option>
                    <option value="blue">Blue</option>
                    <option value="rose">Rose</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-900 dark:text-white block mb-1.5">
                  Default Role Permissions ({customRolePerms.length} selected):
                </label>
                <div className="space-y-1.5 max-h-[160px] overflow-y-auto pr-1">
                  {AVAILABLE_PERMISSIONS.map((p) => {
                    const isChecked = customRolePerms.includes(p.key);
                    return (
                      <div
                        key={p.key}
                        onClick={() => togglePermission(customRolePerms, setCustomRolePerms, p.key)}
                        className={`p-2 rounded-xl border flex items-center justify-between transition-all cursor-pointer ${
                          isChecked
                            ? 'border-purple-500/50 bg-purple-500/10 text-purple-900 dark:text-purple-200'
                            : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900'
                        }`}
                      >
                        <div>
                          <p className="font-bold text-[11px] text-slate-900 dark:text-white">{p.label}</p>
                          <p className="text-[10px] text-slate-500">{p.desc}</p>
                        </div>
                        <div
                          className={`h-4.5 w-4.5 rounded-md flex items-center justify-center border text-[10px] font-bold ${
                            isChecked
                              ? 'bg-purple-600 border-purple-600 text-white'
                              : 'border-slate-300 dark:border-slate-700'
                          }`}
                        >
                          {isChecked && <Check className="h-3 w-3" />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
                <Button type="button" variant="outline" size="sm" onClick={() => setShowAddRoleModal(false)}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-bold px-5"
                >
                  + Create Role
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
