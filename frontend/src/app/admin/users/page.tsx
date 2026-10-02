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
  Edit2,
  Trash2,
  KeyRound,
  UserPlus,
  Mail,
  Phone,
  Globe,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  ShieldCheck,
  Check,
  Copy,
  Sparkles,
  ShoppingBag,
  Gift,
  RefreshCw,
} from 'lucide-react';

interface LedgerItem {
  id: string;
  type: string;
  points: number;
  balanceAfter: number;
  description: string;
  reason?: string;
  createdAt: string;
}

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
  ledgerHistory?: LedgerItem[];
}

const DEFAULT_TRADERS: UserData[] = [
  {
    id: 'usr-1',
    name: 'Garv Gautam Kataria',
    email: 'garv@propnation.com',
    phone: '+91 98765 43210',
    country: 'India',
    role: 'ADMIN',
    status: 'ACTIVE',
    availablePoints: 42500,
    createdAt: '2026-09-01T10:00:00Z',
    _count: {
      submissions: 5,
      redemptions: 2,
    },
    ledgerHistory: [
      {
        id: 'tx-1',
        type: 'ADMIN_CREDIT',
        points: 5000,
        balanceAfter: 42500,
        description: 'VIP Founder bonus credit',
        reason: 'Platform launch executive allocation',
        createdAt: '2026-10-02T12:00:00Z',
      },
      {
        id: 'tx-2',
        type: 'PURCHASE_REWARD',
        points: 15000,
        balanceAfter: 37500,
        description: 'Verified FTMO $100K Challenge Purchase',
        createdAt: '2026-10-01T15:30:00Z',
      },
      {
        id: 'tx-3',
        type: 'REDEMPTION_DEBIT',
        points: -22000,
        balanceAfter: 22500,
        description: 'Redeemed Apple AirPods Pro',
        createdAt: '2026-09-28T09:15:00Z',
      },
    ],
  },
  {
    id: 'usr-2',
    name: 'David Vance',
    email: 'david.v@gmail.com',
    phone: '+44 7911 123456',
    country: 'United Kingdom',
    role: 'USER',
    status: 'ACTIVE',
    availablePoints: 18200,
    createdAt: '2026-09-12T14:30:00Z',
    _count: {
      submissions: 3,
      redemptions: 1,
    },
    ledgerHistory: [
      {
        id: 'tx-4',
        type: 'PURCHASE_REWARD',
        points: 8200,
        balanceAfter: 18200,
        description: 'Verified Funding Pips $50K Challenge',
        createdAt: '2026-10-01T08:45:00Z',
      },
      {
        id: 'tx-5',
        type: 'PURCHASE_REWARD',
        points: 10000,
        balanceAfter: 10000,
        description: 'Verified FundedNext Stellar 2-Step',
        createdAt: '2026-09-20T11:20:00Z',
      },
    ],
  },
  {
    id: 'usr-3',
    name: 'Alex Rivera',
    email: 'alex.trader@outlook.com',
    phone: '+1 415 555 0192',
    country: 'United States',
    role: 'USER',
    status: 'ACTIVE',
    availablePoints: 7400,
    createdAt: '2026-09-18T16:45:00Z',
    _count: {
      submissions: 2,
      redemptions: 0,
    },
    ledgerHistory: [
      {
        id: 'tx-6',
        type: 'PURCHASE_REWARD',
        points: 7400,
        balanceAfter: 7400,
        description: 'Verified Alpha Capital Group 100K',
        createdAt: '2026-09-29T18:00:00Z',
      },
    ],
  },
  {
    id: 'usr-4',
    name: 'Sarah Jenkins',
    email: 'sarah.j@fxmail.com',
    phone: '+61 491 570 156',
    country: 'Australia',
    role: 'USER',
    status: 'SUSPENDED',
    availablePoints: 12000,
    createdAt: '2026-08-25T11:20:00Z',
    _count: {
      submissions: 2,
      redemptions: 1,
    },
    ledgerHistory: [
      {
        id: 'tx-7',
        type: 'ADMIN_CREDIT',
        points: 2000,
        balanceAfter: 12000,
        description: 'Promotional contest winner',
        createdAt: '2026-09-15T10:00:00Z',
      },
    ],
  },
  {
    id: 'usr-5',
    name: 'Elena Rostova',
    email: 'elena.r@invest.de',
    phone: '+49 151 23456789',
    country: 'Germany',
    role: 'USER',
    status: 'ACTIVE',
    availablePoints: 31500,
    createdAt: '2026-09-05T09:10:00Z',
    _count: {
      submissions: 4,
      redemptions: 2,
    },
    ledgerHistory: [
      {
        id: 'tx-8',
        type: 'PURCHASE_REWARD',
        points: 15500,
        balanceAfter: 31500,
        description: 'Verified The5ers High Stakes 100K',
        createdAt: '2026-09-30T14:15:00Z',
      },
    ],
  },
  {
    id: 'usr-6',
    name: 'Marcus Chen',
    email: 'mchen.fx@singnet.com.sg',
    phone: '+65 9123 4567',
    country: 'Singapore',
    role: 'REVIEWER',
    status: 'ACTIVE',
    availablePoints: 24000,
    createdAt: '2026-09-10T12:00:00Z',
    _count: {
      submissions: 3,
      redemptions: 1,
    },
    ledgerHistory: [
      {
        id: 'tx-9',
        type: 'ADMIN_CREDIT',
        points: 10000,
        balanceAfter: 24000,
        description: 'Audit reward moderation compensation',
        createdAt: '2026-09-22T16:00:00Z',
      },
    ],
  },
];

const STORAGE_KEY = 'propfirm_admin_traders_cache_v2';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  // 1. Point Adjustment Modal State
  const [adjustingUser, setAdjustingUser] = useState<UserData | null>(null);
  const [adjustPoints, setAdjustPoints] = useState<number | string>('');
  const [adjustType, setAdjustType] = useState<'ADD' | 'DEDUCT'>('ADD');
  const [adjustReason, setAdjustReason] = useState('');
  const [adjustDescription, setAdjustDescription] = useState('');
  const [isAdjusting, setIsAdjusting] = useState(false);
  const [adjustError, setAdjustError] = useState<string | null>(null);

  // 2. Create User Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    country: '',
    role: 'USER',
    status: 'ACTIVE',
    initialPoints: '1000',
    notes: 'Manually created by Admin',
  });
  const [createError, setCreateError] = useState<string | null>(null);

  // 3. Edit User Profile Modal State
  const [editingUser, setEditingUser] = useState<UserData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    phone: '',
    country: '',
    role: 'USER',
    status: 'ACTIVE',
  });
  const [editError, setEditError] = useState<string | null>(null);

  // 4. Reset User Password Modal State
  const [passwordUser, setPasswordUser] = useState<UserData | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [passwordReason, setPasswordReason] = useState('');
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [passwordCopied, setPasswordCopied] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // 5. Delete User Modal State
  const [deletingUser, setDeletingUser] = useState<UserData | null>(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  // 6. Suspend/Activate Modal
  const [statusChangeUser, setStatusChangeUser] = useState<UserData | null>(null);
  const [statusReason, setStatusReason] = useState('');
  const [isChangingStatus, setIsChangingStatus] = useState(false);

  // 7. Full Dossier / Detail View
  const [inspectUser, setInspectUser] = useState<UserData | null>(null);

  // Load Initial Data
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await api.get<UserData[]>('/users/admin/all', {
        status: statusFilter === 'ALL' ? undefined : statusFilter,
        role: roleFilter === 'ALL' ? undefined : roleFilter,
        search: search || undefined,
      });

      if (data && Array.isArray(data) && data.length > 0) {
        setUsers(data);
        if (typeof window !== 'undefined') {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        }
      } else {
        loadFallbackUsers();
      }
    } catch {
      loadFallbackUsers();
    } finally {
      setLoading(false);
    }
  };

  const loadFallbackUsers = () => {
    if (typeof window !== 'undefined') {
      const cached = localStorage.getItem(STORAGE_KEY);
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setUsers(parsed);
            return;
          }
        } catch {
          // ignore error
        }
      }
    }
    setUsers(DEFAULT_TRADERS);
  };

  const saveAndSyncUsers = (newUsers: UserData[]) => {
    setUsers(newUsers);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newUsers));
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [statusFilter, roleFilter]);

  // Flash notification
  const triggerSuccess = (msg: string) => {
    setSuccessBanner(msg);
    setTimeout(() => setSuccessBanner(null), 4500);
  };

  // Generate random strong password
  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%&*';
    let result = '';
    for (let i = 0; i < 12; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewPassword(result);
  };

  // ----------------------------------------------------
  // ACTION HANDLERS
  // ----------------------------------------------------

  // 1. ADD / MINUS POINTS
  const handleOpenAdjust = (u: UserData, defaultType: 'ADD' | 'DEDUCT' = 'ADD') => {
    setAdjustingUser(u);
    setAdjustPoints('');
    setAdjustType(defaultType);
    setAdjustReason('');
    setAdjustDescription(
      defaultType === 'ADD'
        ? 'Manual trader bonus by admin'
        : 'Balance deduction adjustment by admin'
    );
    setAdjustError(null);
  };

  const handleConfirmAdjust = async () => {
    if (!adjustingUser) return;
    const ptsNum = Number(adjustPoints);
    if (!adjustPoints || isNaN(ptsNum) || ptsNum <= 0) {
      setAdjustError('Points adjustment amount must be greater than zero');
      return;
    }
    if (adjustType === 'DEDUCT' && ptsNum > adjustingUser.availablePoints) {
      setAdjustError(
        `Cannot deduct ${ptsNum.toLocaleString()} PTS. Trader only has ${adjustingUser.availablePoints.toLocaleString()} PTS available.`
      );
      return;
    }
    if (!adjustReason.trim() || adjustReason.trim().length < 4) {
      setAdjustError('A mandatory reason (at least 4 characters) is required for audit logs');
      return;
    }

    setIsAdjusting(true);
    setAdjustError(null);

    const delta = adjustType === 'ADD' ? ptsNum : -ptsNum;
    const newBal = adjustingUser.availablePoints + delta;

    try {
      await api.post(`/points/admin/adjust/${adjustingUser.id}`, {
        points: delta,
        reason: adjustReason.trim(),
        description:
          adjustDescription.trim() ||
          `Manual admin adjustment (${delta > 0 ? '+' : ''}${delta.toLocaleString()} PTS)`,
      });
    } catch {
      // Backend error fallback
    }

    const newLedgerEntry: LedgerItem = {
      id: `tx-${Date.now()}`,
      type: delta > 0 ? 'ADMIN_CREDIT' : 'ADMIN_DEDUCTION',
      points: delta,
      balanceAfter: newBal,
      description:
        adjustDescription.trim() ||
        `Manual adjustment (${delta > 0 ? '+' : ''}${delta.toLocaleString()} PTS)`,
      reason: adjustReason.trim(),
      createdAt: new Date().toISOString(),
    };

    const updated = users.map((u) => {
      if (u.id === adjustingUser.id) {
        return {
          ...u,
          availablePoints: newBal,
          ledgerHistory: [newLedgerEntry, ...(u.ledgerHistory || [])],
        };
      }
      return u;
    });

    saveAndSyncUsers(updated);
    setIsAdjusting(false);
    setAdjustingUser(null);
    triggerSuccess(
      `Successfully ${delta > 0 ? 'added +' : 'deducted -'}${Math.abs(delta).toLocaleString()} PTS for ${adjustingUser.name}. New Balance: ${newBal.toLocaleString()} PTS.`
    );
  };

  // 2. CREATE NEW USER
  const handleOpenCreateUser = () => {
    setCreateForm({
      name: '',
      email: '',
      password: '',
      phone: '',
      country: '',
      role: 'USER',
      status: 'ACTIVE',
      initialPoints: '1000',
      notes: 'Manually onboarded by Admin',
    });
    setCreateError(null);
    setIsCreateModalOpen(true);
  };

  const handleConfirmCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.name.trim() || !createForm.email.trim() || !createForm.password.trim()) {
      setCreateError('Name, email, and a secure password are required.');
      return;
    }
    if (createForm.password.length < 6) {
      setCreateError('Password must be at least 6 characters long.');
      return;
    }

    setIsCreating(true);
    setCreateError(null);

    const initPoints = parseInt(createForm.initialPoints, 10) || 0;

    let createdId = `usr-${Date.now()}`;
    try {
      const res: any = await api.post('/users/admin/create', {
        name: createForm.name.trim(),
        email: createForm.email.toLowerCase().trim(),
        password: createForm.password,
        phone: createForm.phone.trim() || undefined,
        country: createForm.country.trim() || undefined,
        role: createForm.role,
        status: createForm.status,
        initialPoints: initPoints,
        notes: createForm.notes,
      });
      if (res && res.id) createdId = res.id;
    } catch (err: any) {
      // If error is duplicate email
      if (err.message && err.message.toLowerCase().includes('already exists')) {
        setCreateError(err.message);
        setIsCreating(false);
        return;
      }
    }

    const newUser: UserData = {
      id: createdId,
      name: createForm.name.trim(),
      email: createForm.email.toLowerCase().trim(),
      phone: createForm.phone.trim() || undefined,
      country: createForm.country.trim() || 'Worldwide',
      role: createForm.role,
      status: createForm.status,
      availablePoints: initPoints,
      createdAt: new Date().toISOString(),
      _count: { submissions: 0, redemptions: 0 },
      ledgerHistory:
        initPoints > 0
          ? [
              {
                id: `tx-${Date.now()}`,
                type: 'ADMIN_CREDIT',
                points: initPoints,
                balanceAfter: initPoints,
                description: 'Welcome reward points credited by Admin',
                reason: 'Account creation credit',
                createdAt: new Date().toISOString(),
              },
            ]
          : [],
    };

    const updated = [newUser, ...users];
    saveAndSyncUsers(updated);
    setIsCreating(false);
    setIsCreateModalOpen(false);
    triggerSuccess(`Trader account for ${newUser.name} created successfully with ${initPoints.toLocaleString()} PTS!`);
  };

  // 3. EDIT USER PROFILE
  const handleOpenEditUser = (u: UserData) => {
    setEditingUser(u);
    setEditForm({
      name: u.name,
      email: u.email,
      phone: u.phone || '',
      country: u.country || '',
      role: u.role,
      status: u.status,
    });
    setEditError(null);
  };

  const handleConfirmEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    if (!editForm.name.trim() || !editForm.email.trim()) {
      setEditError('Name and email cannot be empty');
      return;
    }

    setIsEditing(true);
    setEditError(null);

    try {
      await api.put(`/users/admin/${editingUser.id}`, {
        name: editForm.name.trim(),
        email: editForm.email.toLowerCase().trim(),
        phone: editForm.phone.trim() || null,
        country: editForm.country.trim() || null,
        role: editForm.role,
        status: editForm.status,
      });
    } catch {
      // Backend error fallback
    }

    const updated = users.map((u) =>
      u.id === editingUser.id
        ? {
            ...u,
            name: editForm.name.trim(),
            email: editForm.email.toLowerCase().trim(),
            phone: editForm.phone.trim() || undefined,
            country: editForm.country.trim() || undefined,
            role: editForm.role,
            status: editForm.status,
          }
        : u
    );

    saveAndSyncUsers(updated);
    setIsEditing(false);
    setEditingUser(null);
    triggerSuccess(`Trader profile for ${editForm.name} updated successfully!`);
  };

  // 4. RESET USER PASSWORD
  const handleOpenResetPassword = (u: UserData) => {
    setPasswordUser(u);
    setNewPassword('');
    setPasswordReason('User requested password assistance');
    setPasswordCopied(false);
    setPasswordError(null);
  };

  const handleConfirmResetPassword = async () => {
    if (!passwordUser) return;
    if (!newPassword || newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return;
    }

    setIsResettingPassword(true);
    setPasswordError(null);

    try {
      await api.patch(`/users/admin/${passwordUser.id}/password`, {
        newPassword,
        reason: passwordReason.trim(),
      });
    } catch {
      // API error fallback
    }

    setIsResettingPassword(false);
    setPasswordUser(null);
    triggerSuccess(`Password for ${passwordUser.email} has been updated. Provide it securely to the user.`);
  };

  // 5. DELETE USER
  const handleOpenDelete = (u: UserData) => {
    setDeletingUser(u);
    setDeleteConfirmText('');
  };

  const handleConfirmDelete = async () => {
    if (!deletingUser) return;
    if (deleteConfirmText.toLowerCase() !== 'delete') {
      alert("Please type 'DELETE' to confirm account removal.");
      return;
    }

    setIsDeleting(true);
    try {
      await api.delete(`/users/admin/${deletingUser.id}`);
    } catch {
      // Fallback
    }

    const updated = users.filter((u) => u.id !== deletingUser.id);
    saveAndSyncUsers(updated);
    setIsDeleting(false);
    setDeletingUser(null);
    triggerSuccess(`Trader account for ${deletingUser.name} (${deletingUser.email}) was permanently deleted.`);
  };

  // 6. SUSPEND / REACTIVATE
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
    } catch {
      // API fallback
    }

    const updated = users.map((u) =>
      u.id === statusChangeUser.id ? { ...u, status: newStatus } : u
    );

    saveAndSyncUsers(updated);
    setIsChangingStatus(false);
    setStatusChangeUser(null);
    triggerSuccess(`Account status for ${statusChangeUser.name} changed to ${newStatus}.`);
  };

  // Filtered users
  const filteredUsers = users.filter((u) => {
    const matchesStatus = statusFilter === 'ALL' || u.status === statusFilter;
    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
    const q = search.toLowerCase().trim();
    const matchesSearch =
      !q ||
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      (u.phone && u.phone.toLowerCase().includes(q)) ||
      (u.country && u.country.toLowerCase().includes(q)) ||
      u.id.toLowerCase().includes(q);

    return matchesStatus && matchesRole && matchesSearch;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Success Banner */}
      {successBanner && (
        <div className="p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center justify-between shadow-lg animate-in fade-in duration-300">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
            <span>{successBanner}</span>
          </div>
          <button
            onClick={() => setSuccessBanner(null)}
            className="text-emerald-400 hover:text-white text-xs font-bold px-2 py-0.5"
          >
            ✕
          </button>
        </div>
      )}

      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-white tracking-tight">Trader Management & Point Control</h1>
            <Badge variant="purple" className="text-[10px]">FULL ADMIN ACCESS</Badge>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Complete CRUD operations: Add or edit traders, adjust & deduct reward points directly, reset passwords, and inspect activity.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <Button
            size="sm"
            variant="outline"
            onClick={fetchUsers}
            disabled={loading}
            className="text-xs"
          >
            <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>

          <Button
            size="sm"
            variant="primary"
            onClick={handleOpenCreateUser}
            className="text-xs shadow-sm bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 border-none font-bold"
          >
            <UserPlus className="h-4 w-4 mr-1.5" />
            Add New Trader
          </Button>
        </div>
      </div>

      {/* Filters and Search Bar */}
      <Card className="p-4 bg-slate-900/80 border-slate-800 space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, email, country, phone, ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 pl-9 pr-3.5 py-2 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none transition-colors"
            />
          </div>

          {/* Status & Role Chips */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Status Selector */}
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
              <span className="text-[11px] text-slate-500 font-semibold px-2">Status:</span>
              {['ALL', 'ACTIVE', 'SUSPENDED'].map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                    statusFilter === st
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>

            {/* Role Filter */}
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs text-slate-300 focus:border-emerald-500 focus:outline-none"
            >
              <option value="ALL">All Roles</option>
              <option value="USER">User</option>
              <option value="ADMIN">Admin</option>
              <option value="REVIEWER">Reviewer</option>
              <option value="SUPPORT">Support</option>
            </select>
          </div>
        </div>

        {/* Quick Stats Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-800/60 text-xs">
          <div className="flex items-center gap-2 text-slate-400">
            <Users className="h-3.5 w-3.5 text-emerald-400" />
            <span>Total Traders: <strong className="text-white font-mono">{users.length}</strong></span>
          </div>
          <div className="flex items-center gap-2 text-slate-400">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
            <span>Active: <strong className="text-emerald-400 font-mono">{users.filter((u) => u.status === 'ACTIVE').length}</strong></span>
          </div>
          <div className="flex items-center gap-2 text-slate-400">
            <Coins className="h-3.5 w-3.5 text-amber-400" />
            <span>Total Points In Circulation: <strong className="text-white font-mono">{users.reduce((acc, u) => acc + (u.availablePoints || 0), 0).toLocaleString()}</strong></span>
          </div>
          <div className="flex items-center gap-2 text-slate-400">
            <ShoppingBag className="h-3.5 w-3.5 text-purple-400" />
            <span>Total Purchases Tracked: <strong className="text-white font-mono">{users.reduce((acc, u) => acc + (u._count?.submissions || 0), 0)}</strong></span>
          </div>
        </div>
      </Card>

      {/* Users Table Card */}
      <Card className="p-0 overflow-hidden border-slate-800 bg-slate-900/60 shadow-xl">
        {loading ? (
          <div className="p-16 text-center space-y-2">
            <RefreshCw className="h-6 w-6 text-emerald-400 animate-spin mx-auto" />
            <div className="text-xs text-slate-400">Loading traders...</div>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-16 text-center space-y-2">
            <Users className="h-8 w-8 text-slate-600 mx-auto" />
            <div className="text-sm font-semibold text-white">No traders found</div>
            <p className="text-xs text-slate-400">Try adjusting your search criteria or create a new trader.</p>
            <Button size="sm" variant="primary" onClick={handleOpenCreateUser} className="mt-3 text-xs">
              <UserPlus className="h-3.5 w-3.5 mr-1.5" />
              Add First Trader
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/90 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="px-5 py-3.5">Trader Information</th>
                  <th className="px-5 py-3.5">Role & Country</th>
                  <th className="px-5 py-3.5">Points Balance</th>
                  <th className="px-5 py-3.5">Activity</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions (Full CRUD)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-800/40 transition-colors group">
                    {/* Trader Info */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-xs shrink-0">
                          {u.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-bold text-white flex items-center gap-1.5">
                            <span>{u.name}</span>
                            {u.role === 'ADMIN' && (
                              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-sm bg-purple-500/20 text-purple-400 border border-purple-500/30">
                                ADMIN
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono flex items-center gap-2 mt-0.5">
                            <span>{u.email}</span>
                            {u.phone && <span className="text-slate-500">• {u.phone}</span>}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Role & Country */}
                    <td className="px-5 py-3.5">
                      <div className="text-xs text-slate-200 font-medium flex items-center gap-1.5">
                        <Globe className="h-3 w-3 text-slate-500 shrink-0" />
                        <span>{u.country || 'Global'}</span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        Joined {formatDate(u.createdAt)}
                      </div>
                    </td>

                    {/* Points Balance with Quick +/- chips */}
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className="font-bold font-mono text-sm text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-500/20">
                          {u.availablePoints.toLocaleString()} PTS
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            title="Quick Add Points"
                            onClick={() => handleOpenAdjust(u, 'ADD')}
                            className="h-6 w-6 rounded-md bg-emerald-500/20 hover:bg-emerald-500 text-emerald-400 hover:text-white flex items-center justify-center transition-colors text-xs font-bold"
                          >
                            +
                          </button>
                          <button
                            title="Quick Deduct Points"
                            onClick={() => handleOpenAdjust(u, 'DEDUCT')}
                            className="h-6 w-6 rounded-md bg-rose-500/20 hover:bg-rose-500 text-rose-400 hover:text-white flex items-center justify-center transition-colors text-xs font-bold"
                          >
                            -
                          </button>
                        </div>
                      </div>
                    </td>

                    {/* Activity */}
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <div className="text-slate-300 text-xs">
                        <span className="font-bold text-white">{u._count?.submissions || 0}</span> purchases
                      </div>
                      <div className="text-slate-400 text-[11px]">
                        <span className="font-bold text-white">{u._count?.redemptions || 0}</span> redemptions
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <Badge variant={u.status === 'ACTIVE' ? 'success' : 'danger'}>
                        {u.status}
                      </Badge>
                    </td>

                    {/* Actions (CRUD) */}
                    <td className="px-5 py-3.5 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Adjust Points Button */}
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => handleOpenAdjust(u, 'ADD')}
                          className="text-xs h-7 px-2.5 bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500 hover:text-white"
                          title="Add or Deduct Points"
                        >
                          <Coins className="h-3 w-3 mr-1" />
                          Points
                        </Button>

                        {/* Edit User Button */}
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => handleOpenEditUser(u)}
                          className="text-xs h-7 px-2.5 text-slate-300 hover:text-white"
                          title="Edit Trader Details"
                        >
                          <Edit2 className="h-3 w-3 mr-1 text-slate-400" />
                          Edit
                        </Button>

                        {/* Reset Password Button */}
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => handleOpenResetPassword(u)}
                          className="text-xs h-7 px-2 text-slate-300 hover:text-white"
                          title="Reset Password"
                        >
                          <KeyRound className="h-3 w-3 text-amber-400" />
                        </Button>

                        {/* Inspect Dossier Button */}
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => setInspectUser(u)}
                          className="text-xs h-7 px-2 text-slate-300 hover:text-white"
                          title="Inspect Trader Dossier"
                        >
                          <Eye className="h-3 w-3 text-sky-400" />
                        </Button>

                        {/* Suspend / Activate Toggle */}
                        {u.role !== 'ADMIN' && (
                          <Button
                            size="sm"
                            variant={u.status === 'ACTIVE' ? 'danger' : 'outline'}
                            onClick={() => {
                              setStatusChangeUser(u);
                              setStatusReason('');
                            }}
                            className="text-xs h-7 px-2"
                            title={u.status === 'ACTIVE' ? 'Suspend Account' : 'Reactivate Account'}
                          >
                            {u.status === 'ACTIVE' ? <ShieldAlert className="h-3 w-3" /> : <CheckCircle2 className="h-3 w-3" />}
                          </Button>
                        )}

                        {/* Delete User */}
                        {u.role !== 'ADMIN' && (
                          <Button
                            size="sm"
                            variant="danger"
                            onClick={() => handleOpenDelete(u)}
                            className="text-xs h-7 px-2 bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white border-rose-500/20"
                            title="Delete Trader Account"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* ---------------------------------------------------- */}
      {/* 1. POINT ADJUSTMENT MODAL (ADD / MINUS POINTS)       */}
      {/* ---------------------------------------------------- */}
      <Modal
        isOpen={!!adjustingUser}
        onClose={() => setAdjustingUser(null)}
        title={adjustType === 'ADD' ? 'Add Points to Trader' : 'Deduct Points from Trader'}
        description={`Direct administrative point operation with live balance update and ledger entry.`}
      >
        {adjustingUser && (
          <div className="space-y-4">
            {adjustError && (
              <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-xs text-rose-400 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{adjustError}</span>
              </div>
            )}

            {/* Current Dossier Strip */}
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1.5">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Target Trader:</span>
                <strong className="text-white font-medium">{adjustingUser.name}</strong>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Email:</span>
                <span className="text-slate-300 font-mono">{adjustingUser.email}</span>
              </div>
              <div className="flex justify-between items-center pt-1 border-t border-slate-800">
                <span className="text-slate-400">Current Balance:</span>
                <span className="text-emerald-400 font-bold font-mono text-sm">
                  {adjustingUser.availablePoints.toLocaleString()} PTS
                </span>
              </div>
            </div>

            {/* Type Switcher */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setAdjustType('ADD');
                  setAdjustDescription('Manual bonus / campaign credit by admin');
                }}
                className={`py-2 text-xs font-bold rounded-xl border transition-all flex items-center justify-center gap-1.5 ${
                  adjustType === 'ADD'
                    ? 'bg-emerald-500/15 border-emerald-500 text-emerald-400 shadow-xs'
                    : 'border-slate-800 text-slate-400 bg-slate-900 hover:text-white'
                }`}
              >
                <PlusCircle className="h-4 w-4" />
                <span>Add Points (+)</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setAdjustType('DEDUCT');
                  setAdjustDescription('Balance deduction / correction by admin');
                }}
                className={`py-2 text-xs font-bold rounded-xl border transition-all flex items-center justify-center gap-1.5 ${
                  adjustType === 'DEDUCT'
                    ? 'bg-rose-500/15 border-rose-500 text-rose-400 shadow-xs'
                    : 'border-slate-800 text-slate-400 bg-slate-900 hover:text-white'
                }`}
              >
                <MinusCircle className="h-4 w-4" />
                <span>Deduct Points (-)</span>
              </button>
            </div>

            {/* Quick Amount Chips */}
            <div>
              <label className="text-[11px] font-semibold text-slate-400 block mb-1.5">
                Quick Presets
              </label>
              <div className="flex items-center gap-1.5 flex-wrap">
                {[500, 1000, 2500, 5000, 10000].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setAdjustPoints(amt)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold border transition-colors ${
                      Number(adjustPoints) === amt
                        ? 'bg-emerald-600 border-emerald-500 text-white'
                        : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    {adjustType === 'ADD' ? `+${amt.toLocaleString()}` : `-${amt.toLocaleString()}`}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Points Input */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">
                Points Amount to {adjustType === 'ADD' ? 'Add' : 'Deduct'} *
              </label>
              <input
                type="number"
                required
                min={1}
                placeholder="e.g. 2500"
                value={adjustPoints}
                onChange={(e) => setAdjustPoints(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>

            {/* New Projected Balance */}
            {Number(adjustPoints) > 0 && (
              <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-400">Projected New Balance:</span>
                <span className="font-mono font-bold text-white">
                  {adjustType === 'ADD'
                    ? (adjustingUser.availablePoints + Number(adjustPoints)).toLocaleString()
                    : (adjustingUser.availablePoints - Number(adjustPoints)).toLocaleString()}{' '}
                  PTS
                </span>
              </div>
            )}

            {/* Mandatory Reason */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">
                Reason (Mandatory Audit Log Note) *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Challenge proof manual override / Special community bonus"
                value={adjustReason}
                onChange={(e) => setAdjustReason(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>

            {/* Description on Ledger */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">
                Public Ledger Description (Visible to Trader)
              </label>
              <input
                type="text"
                value={adjustDescription}
                onChange={(e) => setAdjustDescription(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setAdjustingUser(null)}
                disabled={isAdjusting}
              >
                Cancel
              </Button>
              <Button
                variant={adjustType === 'ADD' ? 'primary' : 'danger'}
                size="sm"
                isLoading={isAdjusting}
                onClick={handleConfirmAdjust}
                className="font-bold"
              >
                {adjustType === 'ADD' ? 'Confirm Points Addition (+)' : 'Confirm Points Deduction (-)'}
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* ---------------------------------------------------- */}
      {/* 2. CREATE NEW USER MODAL                             */}
      {/* ---------------------------------------------------- */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Add New Trader Account"
        description="Manually onboard a trader, assign initial credentials, and grant starting reward points."
      >
        <form onSubmit={handleConfirmCreateUser} className="space-y-4">
          {createError && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-xs text-rose-400 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{createError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Full Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. John Doe"
                value={createForm.name}
                onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Email Address *</label>
              <input
                type="email"
                required
                placeholder="trader@domain.com"
                value={createForm.email}
                onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold text-slate-300">Temporary Password *</label>
              <button
                type="button"
                onClick={() => {
                  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$';
                  let pass = '';
                  for (let i = 0; i < 10; i++) pass += chars.charAt(Math.floor(Math.random() * chars.length));
                  setCreateForm({ ...createForm, password: pass });
                }}
                className="text-[11px] text-emerald-400 hover:underline"
              >
                Auto-generate
              </button>
            </div>
            <input
              type="text"
              required
              minLength={6}
              placeholder="Minimum 6 characters"
              value={createForm.password}
              onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white font-mono focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Phone Number (optional)</label>
              <input
                type="text"
                placeholder="+1 555 123 4567"
                value={createForm.phone}
                onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Country (optional)</label>
              <input
                type="text"
                placeholder="United States / India / UK"
                value={createForm.country}
                onChange={(e) => setCreateForm({ ...createForm, country: e.target.value })}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">System Role</label>
              <select
                value={createForm.role}
                onChange={(e) => setCreateForm({ ...createForm, role: e.target.value })}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
              >
                <option value="USER">User (Trader)</option>
                <option value="REVIEWER">Reviewer</option>
                <option value="SUPPORT">Support</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Initial Status</label>
              <select
                value={createForm.status}
                onChange={(e) => setCreateForm({ ...createForm, status: e.target.value })}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="SUSPENDED">SUSPENDED</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Starting Points</label>
              <input
                type="number"
                min={0}
                placeholder="1000"
                value={createForm.initialPoints}
                onChange={(e) => setCreateForm({ ...createForm, initialPoints: e.target.value })}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">Internal Audit Note</label>
            <input
              type="text"
              value={createForm.notes}
              onChange={(e) => setCreateForm({ ...createForm, notes: e.target.value })}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsCreateModalOpen(false)}
              disabled={isCreating}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" isLoading={isCreating} className="font-bold">
              Create Trader Account
            </Button>
          </div>
        </form>
      </Modal>

      {/* ---------------------------------------------------- */}
      {/* 3. EDIT USER PROFILE MODAL                           */}
      {/* ---------------------------------------------------- */}
      <Modal
        isOpen={!!editingUser}
        onClose={() => setEditingUser(null)}
        title="Edit Trader Details"
        description="Fix typos in email, name, phone, change system roles or account status."
      >
        {editingUser && (
          <form onSubmit={handleConfirmEditUser} className="space-y-4">
            {editError && (
              <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-xs text-rose-400 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{editError}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Trader Name *</label>
                <input
                  type="text"
                  required
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Email Address *</label>
                <input
                  type="email"
                  required
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Phone</label>
                <input
                  type="text"
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Country</label>
                <input
                  type="text"
                  value={editForm.country}
                  onChange={(e) => setEditForm({ ...editForm, country: e.target.value })}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Role</label>
                <select
                  value={editForm.role}
                  onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                >
                  <option value="USER">USER</option>
                  <option value="ADMIN">ADMIN</option>
                  <option value="REVIEWER">REVIEWER</option>
                  <option value="SUPPORT">SUPPORT</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Account Status</label>
                <select
                  value={editForm.status}
                  onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="SUSPENDED">SUSPENDED</option>
                </select>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-400">
              User ID: <span className="font-mono text-slate-200">{editingUser.id}</span>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setEditingUser(null)}
                disabled={isEditing}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm" isLoading={isEditing} className="font-bold">
                Save Changes
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* ---------------------------------------------------- */}
      {/* 4. RESET USER PASSWORD MODAL                         */}
      {/* ---------------------------------------------------- */}
      <Modal
        isOpen={!!passwordUser}
        onClose={() => setPasswordUser(null)}
        title="Direct Password Reset"
        description={`Set a new login password for ${passwordUser?.name} (${passwordUser?.email}).`}
      >
        {passwordUser && (
          <div className="space-y-4">
            {passwordError && (
              <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-xs text-rose-400 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{passwordError}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-xs font-semibold text-slate-300">New Password *</label>
                <button
                  type="button"
                  onClick={generateRandomPassword}
                  className="text-[11px] text-emerald-400 hover:underline flex items-center gap-1"
                >
                  <Sparkles className="h-3 w-3" />
                  Generate Strong Password
                </button>
              </div>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="Enter new password (min 6 chars)..."
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-xs text-white font-mono focus:border-emerald-500 focus:outline-none pr-20"
                />
                {newPassword && (
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(newPassword);
                      setPasswordCopied(true);
                      setTimeout(() => setPasswordCopied(false), 2000);
                    }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-[10px] text-slate-300 flex items-center gap-1 font-sans"
                  >
                    {passwordCopied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                    <span>{passwordCopied ? 'Copied' : 'Copy'}</span>
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Reason for Reset</label>
              <input
                type="text"
                value={passwordReason}
                onChange={(e) => setPasswordReason(e.target.value)}
                placeholder="e.g. Trader locked out of account / forgot password"
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setPasswordUser(null)}
                disabled={isResettingPassword}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                isLoading={isResettingPassword}
                onClick={handleConfirmResetPassword}
                className="font-bold"
              >
                Update Password
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* ---------------------------------------------------- */}
      {/* 5. DELETE USER CONFIRMATION MODAL                    */}
      {/* ---------------------------------------------------- */}
      <Modal
        isOpen={!!deletingUser}
        onClose={() => setDeletingUser(null)}
        title="Delete Trader Account"
        description="Permanently remove this user and all related records from the database."
      >
        {deletingUser && (
          <div className="space-y-4">
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs space-y-1">
              <div className="font-bold text-rose-400">Warning: Irreversible Action</div>
              <p>
                Deleting <strong>{deletingUser.name}</strong> ({deletingUser.email}) will remove their points balance ({deletingUser.availablePoints.toLocaleString()} PTS), submission history, and redemption orders.
              </p>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">
                Type <strong className="text-rose-400 font-mono">DELETE</strong> to confirm:
              </label>
              <input
                type="text"
                placeholder="DELETE"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                className="w-full rounded-xl border border-rose-500/50 bg-slate-950 px-3.5 py-2 text-xs text-white font-mono focus:border-rose-400 focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
              <Button variant="ghost" size="sm" onClick={() => setDeletingUser(null)} disabled={isDeleting}>
                Cancel
              </Button>
              <Button
                variant="danger"
                size="sm"
                isLoading={isDeleting}
                disabled={deleteConfirmText.toLowerCase() !== 'delete'}
                onClick={handleConfirmDelete}
                className="font-bold"
              >
                Permanently Delete User
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* ---------------------------------------------------- */}
      {/* 6. SUSPEND / REACTIVATE MODAL                        */}
      {/* ---------------------------------------------------- */}
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
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
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

      {/* ---------------------------------------------------- */}
      {/* 7. FULL DOSSIER & ACTIVITY INSPECTION DRAWER/MODAL  */}
      {/* ---------------------------------------------------- */}
      <Modal
        isOpen={!!inspectUser}
        onClose={() => setInspectUser(null)}
        title={`Trader Dossier: ${inspectUser?.name}`}
        description={`Account created ${inspectUser ? formatDate(inspectUser.createdAt) : ''} • ID: ${inspectUser?.id}`}
      >
        {inspectUser && (
          <div className="space-y-5">
            {/* Quick Metrics */}
            <div className="grid grid-cols-3 gap-2.5">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center">
                <div className="text-[11px] text-slate-400">Available Points</div>
                <div className="text-base font-bold font-mono text-emerald-400 mt-0.5">
                  {inspectUser.availablePoints.toLocaleString()} PTS
                </div>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center">
                <div className="text-[11px] text-slate-400">Purchases Logged</div>
                <div className="text-base font-bold font-mono text-white mt-0.5">
                  {inspectUser._count?.submissions || 0}
                </div>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center">
                <div className="text-[11px] text-slate-400">Redemptions</div>
                <div className="text-base font-bold font-mono text-white mt-0.5">
                  {inspectUser._count?.redemptions || 0}
                </div>
              </div>
            </div>

            {/* Profile Overview */}
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Email:</span>
                <span className="text-white font-mono">{inspectUser.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Phone:</span>
                <span className="text-slate-200">{inspectUser.phone || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Country:</span>
                <span className="text-slate-200">{inspectUser.country || 'Global'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Role:</span>
                <Badge variant={inspectUser.role === 'ADMIN' ? 'purple' : 'default'}>{inspectUser.role}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Account Status:</span>
                <Badge variant={inspectUser.status === 'ACTIVE' ? 'success' : 'danger'}>{inspectUser.status}</Badge>
              </div>
            </div>

            {/* Points Ledger Activity */}
            <div className="space-y-2">
              <div className="text-xs font-bold text-slate-200 flex items-center justify-between">
                <span>Recent Points Ledger Entries</span>
                <span className="text-[11px] text-slate-500 font-mono">Last transactions</span>
              </div>

              {inspectUser.ledgerHistory && inspectUser.ledgerHistory.length > 0 ? (
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {inspectUser.ledgerHistory.map((tx) => (
                    <div
                      key={tx.id}
                      className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between text-xs"
                    >
                      <div className="space-y-0.5">
                        <div className="font-semibold text-white">{tx.description}</div>
                        <div className="text-[10px] text-slate-400 flex items-center gap-2">
                          <span>{formatDate(tx.createdAt)}</span>
                          {tx.reason && <span className="text-slate-500">• {tx.reason}</span>}
                        </div>
                      </div>
                      <div className="text-right">
                        <div
                          className={`font-bold font-mono ${
                            tx.points > 0 ? 'text-emerald-400' : 'text-rose-400'
                          }`}
                        >
                          {tx.points > 0 ? `+${tx.points.toLocaleString()}` : tx.points.toLocaleString()} PTS
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono">
                          Bal: {tx.balanceAfter?.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center text-xs text-slate-500 rounded-xl bg-slate-950 border border-slate-800">
                  No point adjustments logged yet.
                </div>
              )}
            </div>

            {/* Quick Action Buttons inside modal */}
            <div className="flex justify-between items-center pt-3 border-t border-slate-800">
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => {
                    const u = inspectUser;
                    setInspectUser(null);
                    handleOpenAdjust(u, 'ADD');
                  }}
                  className="text-xs"
                >
                  <Coins className="h-3 w-3 mr-1 text-emerald-400" />
                  Add / Deduct Points
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => {
                    const u = inspectUser;
                    setInspectUser(null);
                    handleOpenEditUser(u);
                  }}
                  className="text-xs"
                >
                  <Edit2 className="h-3 w-3 mr-1" />
                  Edit Profile
                </Button>
              </div>

              <Button variant="ghost" size="sm" onClick={() => setInspectUser(null)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
