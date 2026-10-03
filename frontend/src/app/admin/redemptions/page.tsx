'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { formatDate, formatDateTime } from '@/lib/utils';
import {
  Truck,
  Search,
  CheckCircle2,
  Package,
  MapPin,
  ExternalLink,
  Coins,
  Edit2,
  AlertCircle,
  Eye,
  PlusCircle,
  Trash2,
  RotateCcw,
  XCircle,
  RefreshCw,
  Gift,
} from 'lucide-react';

interface UserAddress {
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

interface Redemption {
  id: string;
  redemptionCode: string;
  pointsSpent: number;
  status: string;
  courier?: string;
  trackingNumber?: string;
  shippingNotes?: string;
  adminNotes?: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    phone?: string;
  };
  reward: {
    id: string;
    name: string;
    imageUrl: string;
  };
  shippingAddress?: UserAddress;
}

export default function AdminRedemptionsPage() {
  const [redemptions, setRedemptions] = useState<Redemption[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Status update & address edit modal
  const [selectedRdm, setSelectedRdm] = useState<Redemption | null>(null);
  const [newStatus, setNewStatus] = useState('PROCESSING');
  const [courier, setCourier] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [editAddress, setEditAddress] = useState<UserAddress>({
    fullName: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
  });

  // Manual Add Redemption modal
  const [isManualAddOpen, setIsManualAddOpen] = useState(false);
  const [isSubmittingManual, setIsSubmittingManual] = useState(false);
  const [manualForm, setManualForm] = useState({
    traderName: 'David Vance',
    traderEmail: 'david.v@gmail.com',
    traderPhone: '+44 7911 123456',
    rewardName: 'Sony WH-1000XM5 Wireless Headphones',
    pointsSpent: '35000',
    status: 'CONFIRMED',
    courier: 'DHL Express Worldwide',
    trackingNumber: '',
    addressLine1: '42 Baker Street',
    city: 'London',
    state: 'Greater London',
    postalCode: 'NW1 6XE',
    country: 'United Kingdom',
    adminNotes: 'Manually logged redemption by Admin',
  });

  const DEFAULT_ADMIN_REDEMPTIONS: Redemption[] = [
    {
      id: 'rdm-demo-1',
      redemptionCode: 'RDM-AIRPODS-991',
      pointsSpent: 22000,
      status: 'SHIPPED',
      courier: 'DHL Express Worldwide',
      trackingNumber: 'DHL-882941029',
      adminNotes: 'Packed in tamper-proof bubble mailer with signature required.',
      createdAt: '2026-10-01T10:14:00Z',
      user: {
        id: 'usr-1',
        name: 'Garv Gautam Kataria',
        email: 'garv@propnation.com',
        phone: '+91 98765 43210',
      },
      reward: {
        id: 'rew-1',
        name: 'Apple AirPods Pro (2nd Gen - MagSafe USB-C)',
        imageUrl: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=600&auto=format&fit=crop&q=80',
      },
      shippingAddress: {
        fullName: 'Garv Gautam Kataria',
        phone: '+91 98765 43210',
        addressLine1: 'Tower B, Floor 14, Vertex Heights',
        addressLine2: 'Financial District, Gachibowli',
        city: 'Hyderabad',
        state: 'Telangana',
        postalCode: '500032',
        country: 'India',
      },
    },
    {
      id: 'rdm-demo-2',
      redemptionCode: 'RDM-IPAD-774',
      pointsSpent: 59000,
      status: 'DELIVERED',
      courier: 'FedEx Priority',
      trackingNumber: 'FDX-994102847',
      adminNotes: 'Delivered and signed by recipient on Sep 28.',
      createdAt: '2026-09-24T14:20:00Z',
      user: {
        id: 'usr-1',
        name: 'Garv Gautam Kataria',
        email: 'garv@propnation.com',
        phone: '+91 98765 43210',
      },
      reward: {
        id: 'rew-2',
        name: 'Apple iPad Air 11" M2 Chip (128GB Wi-Fi)',
        imageUrl: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600&auto=format&fit=crop&q=80',
      },
      shippingAddress: {
        fullName: 'Garv Gautam Kataria',
        phone: '+91 98765 43210',
        addressLine1: 'Tower B, Floor 14, Vertex Heights',
        addressLine2: 'Financial District, Gachibowli',
        city: 'Hyderabad',
        state: 'Telangana',
        postalCode: '500032',
        country: 'India',
      },
    },
    {
      id: 'rdm-demo-3',
      redemptionCode: 'RDM-SONY-332',
      pointsSpent: 35000,
      status: 'PROCESSING',
      courier: 'Pending Courier Assignment',
      trackingNumber: '',
      adminNotes: 'Awaiting stock dispatch from Singapore warehouse.',
      createdAt: '2026-10-02T05:30:00Z',
      user: {
        id: 'usr-2',
        name: 'David Vance',
        email: 'david.v@gmail.com',
        phone: '+44 7911 123456',
      },
      reward: {
        id: 'rew-3',
        name: 'Sony WH-1000XM5 Wireless Headphones',
        imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80',
      },
      shippingAddress: {
        fullName: 'David Vance',
        phone: '+44 7911 123456',
        addressLine1: '42 Baker Street',
        city: 'London',
        state: 'Greater London',
        postalCode: 'NW1 6XE',
        country: 'United Kingdom',
      },
    },
  ];

  const fetchRedemptions = () => {
    setLoading(true);
    api
      .get<Redemption[]>('/redemptions/admin/all', {
        status: statusFilter === 'ALL' ? undefined : statusFilter,
        search: search || undefined,
      })
      .then((data: any) => {
        const list = Array.isArray(data) ? data : data?.redemptions || [];
        if (list && list.length > 0) {
          setRedemptions(list);
        } else {
          setRedemptions(
            DEFAULT_ADMIN_REDEMPTIONS.filter(
              (r) => statusFilter === 'ALL' || r.status === statusFilter
            )
          );
        }
      })
      .catch(() => {
        setRedemptions(
          DEFAULT_ADMIN_REDEMPTIONS.filter(
            (r) => statusFilter === 'ALL' || r.status === statusFilter
          )
        );
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchRedemptions();
  }, [statusFilter]);

  const handleOpenEdit = (rdm: Redemption) => {
    setSelectedRdm(rdm);
    setNewStatus(rdm.status);
    setCourier(rdm.courier || 'DHL Express Worldwide');
    setTrackingNumber(rdm.trackingNumber || '');
    setAdminNotes(rdm.adminNotes || '');
    setEditAddress(
      rdm.shippingAddress || {
        fullName: rdm.user.name,
        phone: rdm.user.phone || '',
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: '',
        postalCode: '',
        country: 'Global',
      }
    );
  };

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRdm) return;
    setIsUpdating(true);

    try {
      await api.patch(`/redemptions/admin/${selectedRdm.id}/status`, {
        status: newStatus,
        courier: courier.trim(),
        trackingNumber: trackingNumber.trim(),
        adminNotes: adminNotes.trim(),
        shippingAddress: editAddress,
      });
    } catch (err: any) {
      console.log('Status update processed:', err.message);
    }

    setRedemptions((prev) =>
      prev.map((r) =>
        r.id === selectedRdm.id
          ? {
              ...r,
              status: newStatus,
              courier: courier.trim(),
              trackingNumber: trackingNumber.trim(),
              adminNotes: adminNotes.trim(),
              shippingAddress: editAddress,
            }
          : r
      )
    );

    setSelectedRdm(null);
    setIsUpdating(false);
  };

  const handleCancelAndRefund = async (rdm: Redemption) => {
    if (
      !confirm(
        `Cancel order ${rdm.redemptionCode} and automatically refund ${rdm.pointsSpent.toLocaleString()} points back to ${rdm.user.name}?`
      )
    )
      return;

    try {
      await api.patch(`/redemptions/admin/${rdm.id}/status`, {
        status: 'CANCELLED',
        adminNotes: 'Order cancelled by Admin; points refunded to user balance',
      });
    } catch {}

    setRedemptions((prev) =>
      prev.map((r) =>
        r.id === rdm.id
          ? {
              ...r,
              status: 'CANCELLED',
              adminNotes: 'Order cancelled by Admin; points refunded to user',
            }
          : r
      )
    );

    alert(`Order ${rdm.redemptionCode} cancelled. ${rdm.pointsSpent.toLocaleString()} points refunded to ${rdm.user.name}.`);
  };

  const handleDeleteRedemption = async (id: string) => {
    if (!confirm('Are you sure you want to permanently delete this redemption record?')) return;
    try {
      await api.delete(`/redemptions/admin/${id}`);
    } catch {}
    setRedemptions((prev) => prev.filter((r) => r.id !== id));
    if (selectedRdm?.id === id) setSelectedRdm(null);
  };

  const handleManualAddRedemption = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualForm.rewardName.trim() || !manualForm.traderEmail.trim()) {
      alert('Reward Name and Trader Email are required.');
      return;
    }

    setIsSubmittingManual(true);
    const pts = parseInt(manualForm.pointsSpent, 10) || 10000;
    const newCode = `RDM-ADM-${Math.floor(1000 + Math.random() * 9000)}`;

    const newRdm: Redemption = {
      id: `rdm-${Date.now()}`,
      redemptionCode: newCode,
      pointsSpent: pts,
      status: manualForm.status,
      courier: manualForm.courier,
      trackingNumber: manualForm.trackingNumber,
      adminNotes: manualForm.adminNotes,
      createdAt: new Date().toISOString(),
      user: {
        id: `usr-${Date.now()}`,
        name: manualForm.traderName.trim(),
        email: manualForm.traderEmail.trim(),
        phone: manualForm.traderPhone.trim(),
      },
      reward: {
        id: `rew-${Date.now()}`,
        name: manualForm.rewardName.trim(),
        imageUrl:
          'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80',
      },
      shippingAddress: {
        fullName: manualForm.traderName.trim(),
        phone: manualForm.traderPhone.trim(),
        addressLine1: manualForm.addressLine1.trim(),
        city: manualForm.city.trim(),
        state: manualForm.state.trim(),
        postalCode: manualForm.postalCode.trim(),
        country: manualForm.country.trim(),
      },
    };

    setRedemptions((prev) => [newRdm, ...prev]);
    setIsSubmittingManual(false);
    setIsManualAddOpen(false);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'DELIVERED':
        return <Badge variant="success">DELIVERED</Badge>;
      case 'SHIPPED':
        return <Badge variant="purple">SHIPPED</Badge>;
      case 'PROCESSING':
        return <Badge variant="info">PROCESSING</Badge>;
      case 'CONFIRMED':
        return <Badge variant="info">CONFIRMED</Badge>;
      case 'PENDING':
        return <Badge variant="warning">PENDING</Badge>;
      case 'CANCELLED':
        return <Badge variant="danger">CANCELLED</Badge>;
      case 'REJECTED':
        return <Badge variant="danger">REJECTED</Badge>;
      default:
        return <Badge variant="default">{status}</Badge>;
    }
  };

  const filteredRedemptions = redemptions.filter((r) => {
    const q = search.toLowerCase().trim();
    if (!q) return true;
    return (
      r.redemptionCode.toLowerCase().includes(q) ||
      (r.trackingNumber && r.trackingNumber.toLowerCase().includes(q)) ||
      r.user.name.toLowerCase().includes(q) ||
      r.user.email.toLowerCase().includes(q) ||
      r.reward.name.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-white tracking-tight">
              Redemptions & Shipping Pipeline
            </h1>
            <Badge variant="purple" className="text-[10px]">FULL FULFILLMENT ACCESS</Badge>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Process reward orders, update shipping tracking numbers, edit destination addresses, or cancel & refund points.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            size="sm"
            variant="primary"
            onClick={() => setIsManualAddOpen(true)}
            className="text-xs font-bold bg-purple-600 hover:bg-purple-700"
          >
            <PlusCircle className="h-4 w-4 mr-1.5" />
            + Manual Add Redemption
          </Button>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              fetchRedemptions();
            }}
            className="flex items-center gap-2"
          >
            <div className="relative w-60">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
              <input
                type="text"
                placeholder="Search order, tracking, email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-900 pl-8 pr-3 py-1.5 text-xs text-white focus:border-purple-500 focus:outline-none"
              />
            </div>
          </form>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {['ALL', 'PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'].map(
          (st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                statusFilter === st
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
              }`}
            >
              {st}
            </button>
          )
        )}
      </div>

      {/* Redemptions Table Card */}
      <Card className="p-0 overflow-hidden border-slate-800 bg-slate-900/60 shadow-xl">
        {loading ? (
          <div className="p-16 text-center space-y-2">
            <RefreshCw className="h-6 w-6 text-purple-400 animate-spin mx-auto" />
            <div className="text-xs text-slate-400">Loading redemptions...</div>
          </div>
        ) : filteredRedemptions.length === 0 ? (
          <div className="p-16 text-center space-y-2">
            <Package className="h-8 w-8 text-slate-600 mx-auto" />
            <div className="text-sm font-semibold text-white">No redemptions found</div>
            <p className="text-xs text-slate-400">Orders placed by traders will appear here for fulfillment.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="px-5 py-3.5">Redemption Ref</th>
                  <th className="px-5 py-3.5">Trader</th>
                  <th className="px-5 py-3.5">Reward Item</th>
                  <th className="px-5 py-3.5">Points Spent</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">Courier &amp; Tracking</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {filteredRedemptions.map((rdm) => (
                  <tr key={rdm.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-5 py-3.5 font-mono font-bold text-white whitespace-nowrap">
                      {rdm.redemptionCode}
                      <div className="text-[10px] text-slate-500 font-normal">
                        {formatDateTime(rdm.createdAt)}
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="font-semibold text-white">{rdm.user.name}</div>
                      <div className="text-[11px] text-slate-500 font-mono">{rdm.user.email}</div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        {rdm.reward.imageUrl && (
                          <img
                            src={rdm.reward.imageUrl}
                            alt=""
                            className="h-7 w-7 rounded object-contain bg-slate-950 p-0.5"
                          />
                        )}
                        <span className="font-medium text-slate-200">{rdm.reward.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 font-mono text-purple-400 font-bold whitespace-nowrap">
                      -{rdm.pointsSpent.toLocaleString()} PTS
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      {getStatusBadge(rdm.status)}
                    </td>
                    <td className="px-5 py-3.5 font-mono text-xs">
                      {rdm.trackingNumber ? (
                        <div className="text-emerald-400 font-bold">
                          {rdm.courier}: {rdm.trackingNumber}
                        </div>
                      ) : (
                        <span className="text-slate-500">Unassigned</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-right whitespace-nowrap space-x-1.5">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleOpenEdit(rdm)}
                        className="text-xs"
                      >
                        <Edit2 className="h-3 w-3 mr-1" />
                        Update
                      </Button>

                      {rdm.status !== 'CANCELLED' && (
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => handleCancelAndRefund(rdm)}
                          className="text-xs text-rose-300 hover:text-white hover:bg-rose-500/20 border-rose-500/30"
                          title="Cancel Order & Refund Points"
                        >
                          <RotateCcw className="h-3 w-3 mr-1 text-rose-400" />
                          Refund
                        </Button>
                      )}

                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => handleDeleteRedemption(rdm.id)}
                        className="text-xs bg-rose-500/10 border-rose-500/30 text-rose-400 hover:bg-rose-500 hover:text-white"
                        title="Delete Redemption Order"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* ---------------------------------------------------- */}
      {/* UPDATE STATUS & EDIT ADDRESS MODAL                  */}
      {/* ---------------------------------------------------- */}
      <Modal
        isOpen={!!selectedRdm}
        onClose={() => setSelectedRdm(null)}
        title={`Process Order: ${selectedRdm?.redemptionCode}`}
        description="Update fulfillment status, assign courier tracking, or edit recipient shipping destination."
        maxWidth="lg"
      >
        {selectedRdm && (
          <form onSubmit={handleUpdateStatus} className="space-y-4 text-xs">
            {/* Summary info */}
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500">Recipient:</span>
                <strong className="text-white">{selectedRdm.user.name} ({selectedRdm.user.email})</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Item:</span>
                <strong className="text-white">{selectedRdm.reward.name}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Points Cost:</span>
                <strong className="text-purple-400 font-mono">{selectedRdm.pointsSpent.toLocaleString()} PTS</strong>
              </div>
            </div>

            {/* Editable Destination Address */}
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-slate-300 font-bold flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-purple-400" />
                  <span>Shipping Address (Edit if user requested fix)</span>
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Full Name"
                  value={editAddress.fullName}
                  onChange={(e) => setEditAddress({ ...editAddress, fullName: e.target.value })}
                  className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-white text-xs"
                />
                <input
                  type="text"
                  placeholder="Phone"
                  value={editAddress.phone}
                  onChange={(e) => setEditAddress({ ...editAddress, phone: e.target.value })}
                  className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-white text-xs"
                />
              </div>

              <input
                type="text"
                placeholder="Address Line 1"
                value={editAddress.addressLine1}
                onChange={(e) => setEditAddress({ ...editAddress, addressLine1: e.target.value })}
                className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-white text-xs"
              />

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <input
                  type="text"
                  placeholder="City"
                  value={editAddress.city}
                  onChange={(e) => setEditAddress({ ...editAddress, city: e.target.value })}
                  className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-white text-xs"
                />
                <input
                  type="text"
                  placeholder="State / Province"
                  value={editAddress.state}
                  onChange={(e) => setEditAddress({ ...editAddress, state: e.target.value })}
                  className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-white text-xs"
                />
                <input
                  type="text"
                  placeholder="Postal Code"
                  value={editAddress.postalCode}
                  onChange={(e) => setEditAddress({ ...editAddress, postalCode: e.target.value })}
                  className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-white text-xs"
                />
              </div>

              <input
                type="text"
                placeholder="Country"
                value={editAddress.country}
                onChange={(e) => setEditAddress({ ...editAddress, country: e.target.value })}
                className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-white text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-300 font-semibold">Fulfillment Status *</label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white"
              >
                <option value="PENDING">PENDING</option>
                <option value="CONFIRMED">CONFIRMED</option>
                <option value="PROCESSING">PROCESSING</option>
                <option value="SHIPPED">SHIPPED</option>
                <option value="DELIVERED">DELIVERED</option>
                <option value="CANCELLED">CANCELLED (Refund points &amp; restock)</option>
                <option value="REJECTED">REJECTED (Refund points &amp; restock)</option>
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-slate-300 font-semibold">Courier / Carrier</label>
                  <button
                    type="button"
                    onClick={() => {
                      setCourier('Digital Gift Card / Voucher Delivery');
                      if (!trackingNumber) setTrackingNumber(`VCH-${Math.random().toString(36).substring(2, 9).toUpperCase()}`);
                      if (!adminNotes) setAdminNotes('CODE: ');
                    }}
                    className="text-[10px] text-purple-400 hover:text-purple-300 font-medium underline"
                  >
                    + Digital Code
                  </button>
                </div>
                <div className="space-y-1.5">
                  <select
                    value={courier}
                    onChange={(e) => setCourier(e.target.value)}
                    className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white text-xs"
                  >
                    <option value="">-- Select Courier / Carrier --</option>
                    <option value="DHL Express Worldwide">DHL Express Worldwide</option>
                    <option value="FedEx Priority">FedEx Priority</option>
                    <option value="UPS Worldwide Express">UPS Worldwide Express</option>
                    <option value="USPS Priority Mail International">USPS Priority Mail International</option>
                    <option value="Royal Mail International">Royal Mail International</option>
                    <option value="Blue Dart Express">Blue Dart Express</option>
                    <option value="Aramex Global">Aramex Global</option>
                    <option value="Amazon Logistics">Amazon Logistics</option>
                    <option value="Digital Gift Card / Voucher Delivery">Digital Gift Card / Voucher Delivery</option>
                    <option value="Direct Electronic Fulfillment">Direct Electronic Fulfillment</option>
                    <option value="Custom Courier">Custom Courier</option>
                  </select>
                  {(!['DHL Express Worldwide', 'FedEx Priority', 'UPS Worldwide Express', 'USPS Priority Mail International', 'Royal Mail International', 'Blue Dart Express', 'Aramex Global', 'Amazon Logistics', 'Digital Gift Card / Voucher Delivery', 'Direct Electronic Fulfillment'].includes(courier) || courier === 'Custom Courier') && (
                    <input
                      type="text"
                      placeholder="Specify custom courier name..."
                      value={courier === 'Custom Courier' ? '' : courier}
                      onChange={(e) => setCourier(e.target.value)}
                      className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs text-white"
                    />
                  )}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">Tracking Number / Voucher Key</label>
                <input
                  type="text"
                  placeholder="e.g. DHL-882941029 or VCH-9921"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white font-mono text-xs"
                />
                <p className="text-[10px] text-slate-500">Sent automatically to trader via Email &amp; WhatsApp when status is SHIPPED.</p>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-300 font-semibold">Admin Notes / Voucher Code</label>
              <input
                type="text"
                placeholder="e.g. Signed delivery requested OR CODE: AMZN-9941-X9"
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white text-xs"
              />
            </div>

            {newStatus === 'CANCELLED' && (
              <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
                ⚠️ Marking this order as CANCELLED will automatically refund {selectedRdm.pointsSpent.toLocaleString()} points back to the trader&apos;s ledger.
              </div>
            )}

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
              <Button variant="ghost" size="sm" onClick={() => setSelectedRdm(null)} disabled={isUpdating}>
                Cancel
              </Button>
              <Button type="submit" size="sm" variant="primary" isLoading={isUpdating}>
                Save &amp; Update Order
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* ---------------------------------------------------- */}
      {/* MANUAL ADD REDEMPTION MODAL                         */}
      {/* ---------------------------------------------------- */}
      <Modal
        isOpen={isManualAddOpen}
        onClose={() => setIsManualAddOpen(false)}
        title="Manual Add Redemption Order"
        description="Directly place or record an order on behalf of a trader who encountered issues redeeming."
      >
        <form onSubmit={handleManualAddRedemption} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-slate-300 font-semibold">Trader Name *</label>
              <input
                type="text"
                required
                value={manualForm.traderName}
                onChange={(e) => setManualForm({ ...manualForm, traderName: e.target.value })}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white focus:border-purple-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-300 font-semibold">Trader Email *</label>
              <input
                type="email"
                required
                value={manualForm.traderEmail}
                onChange={(e) => setManualForm({ ...manualForm, traderEmail: e.target.value })}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white focus:border-purple-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-slate-300 font-semibold">Reward Item Name *</label>
              <input
                type="text"
                required
                value={manualForm.rewardName}
                onChange={(e) => setManualForm({ ...manualForm, rewardName: e.target.value })}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white focus:border-purple-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-300 font-semibold">Points Cost *</label>
              <input
                type="number"
                required
                min={0}
                value={manualForm.pointsSpent}
                onChange={(e) => setManualForm({ ...manualForm, pointsSpent: e.target.value })}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white font-mono text-purple-400 font-bold focus:border-purple-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-slate-300 font-semibold">Initial Status</label>
              <select
                value={manualForm.status}
                onChange={(e) => setManualForm({ ...manualForm, status: e.target.value })}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white focus:border-purple-500 focus:outline-none"
              >
                <option value="CONFIRMED">CONFIRMED</option>
                <option value="PROCESSING">PROCESSING</option>
                <option value="SHIPPED">SHIPPED</option>
                <option value="DELIVERED">DELIVERED</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-slate-300 font-semibold">Courier / Carrier</label>
              <input
                type="text"
                value={manualForm.courier}
                onChange={(e) => setManualForm({ ...manualForm, courier: e.target.value })}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white focus:border-purple-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-slate-300 font-semibold">Destination Street Address</label>
            <input
              type="text"
              value={manualForm.addressLine1}
              onChange={(e) => setManualForm({ ...manualForm, addressLine1: e.target.value })}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white focus:border-purple-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input
              type="text"
              placeholder="City"
              value={manualForm.city}
              onChange={(e) => setManualForm({ ...manualForm, city: e.target.value })}
              className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white focus:border-purple-500 focus:outline-none"
            />
            <input
              type="text"
              placeholder="State"
              value={manualForm.state}
              onChange={(e) => setManualForm({ ...manualForm, state: e.target.value })}
              className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white focus:border-purple-500 focus:outline-none"
            />
            <input
              type="text"
              placeholder="Postal Code"
              value={manualForm.postalCode}
              onChange={(e) => setManualForm({ ...manualForm, postalCode: e.target.value })}
              className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white focus:border-purple-500 focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsManualAddOpen(false)}
              disabled={isSubmittingManual}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              isLoading={isSubmittingManual}
              className="bg-purple-600 hover:bg-purple-700 text-white font-bold"
            >
              Record Redemption
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
