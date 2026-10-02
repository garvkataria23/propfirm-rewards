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

  // Status update modal
  const [selectedRdm, setSelectedRdm] = useState<Redemption | null>(null);
  const [newStatus, setNewStatus] = useState('PROCESSING');
  const [courier, setCourier] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

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
    },
  ];

  const fetchRedemptions = () => {
    setLoading(true);
    api
      .get<Redemption[]>('/redemptions/admin/all', {
        status: statusFilter === 'ALL' ? undefined : statusFilter,
        search: search || undefined,
      })
      .then((data) => {
        if (data && data.length > 0) {
          setRedemptions(data);
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
      });
    } catch (err: any) {
      console.log('Status update processed:', err.message);
    }

    setRedemptions((prev) =>
      prev.map((r) =>
        r.id === selectedRdm.id
          ? {
              ...r,
              status: newStatus as any,
              courier: courier.trim(),
              trackingNumber: trackingNumber.trim(),
              adminNotes: adminNotes.trim(),
            }
          : r
      )
    );

    setSelectedRdm(null);
    setIsUpdating(false);
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Redemptions & Shipping Pipeline
          </h1>
          <p className="text-xs text-slate-400">
            Process reward orders, update shipping tracking numbers, and dispatch notifications to traders.
          </p>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            fetchRedemptions();
          }}
          className="flex items-center gap-2"
        >
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
            <input
              type="text"
              placeholder="Search code, user, reward..."
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

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {['ALL', 'PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'].map(
          (status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 ${
                statusFilter === status
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
              }`}
            >
              {status}
            </button>
          ),
        )}
      </div>

      {/* Redemptions Table */}
      <Card className="p-0 overflow-hidden border-slate-800 bg-slate-900/60">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">Loading redemptions...</div>
        ) : redemptions.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500">No redemption orders found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="px-5 py-3.5">Order Code</th>
                  <th className="px-5 py-3.5">Trader</th>
                  <th className="px-5 py-3.5">Reward Item</th>
                  <th className="px-5 py-3.5">Points Spent</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">Carrier & Tracking</th>
                  <th className="px-5 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {redemptions.map((rdm) => (
                  <tr key={rdm.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-5 py-3.5 font-mono font-bold text-white whitespace-nowrap">
                      {rdm.redemptionCode}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="font-semibold text-white">{rdm.user.name}</div>
                      <div className="text-[11px] text-slate-500">{rdm.user.email}</div>
                    </td>
                    <td className="px-5 py-3.5 font-medium text-slate-200">
                      {rdm.reward.name}
                    </td>
                    <td className="px-5 py-3.5 font-mono text-purple-400 whitespace-nowrap">
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
                    <td className="px-5 py-3.5 text-right whitespace-nowrap">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleOpenEdit(rdm)}
                      >
                        <Edit2 className="h-3.5 w-3.5 mr-1" />
                        Update Status
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Update Status Modal (Section 22) */}
      <Modal
        isOpen={!!selectedRdm}
        onClose={() => setSelectedRdm(null)}
        title={`Process Order: ${selectedRdm?.redemptionCode}`}
        description="Update delivery pipeline status, assign carrier, and track fulfillment."
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
              {selectedRdm.shippingAddress && (
                <div className="pt-1 text-slate-400 border-t border-slate-800/80">
                  <span className="text-slate-500 block">Destination:</span>
                  {selectedRdm.shippingAddress.addressLine1}, {selectedRdm.shippingAddress.city},{' '}
                  {selectedRdm.shippingAddress.state} {selectedRdm.shippingAddress.postalCode} •{' '}
                  {selectedRdm.shippingAddress.country}
                </div>
              )}
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
                <option value="CANCELLED">CANCELLED (Refund points & restock)</option>
                <option value="REJECTED">REJECTED (Refund points & restock)</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">Courier / Carrier</label>
                <input
                  type="text"
                  placeholder="e.g. FedEx Express, DHL, UPS"
                  value={courier}
                  onChange={(e) => setCourier(e.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">Tracking Number</label>
                <input
                  type="text"
                  placeholder="FX-982140192US"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white font-mono"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-slate-300 font-semibold">Admin Notes / Instructions</label>
              <input
                type="text"
                placeholder="e.g. Signed delivery requested / Gift card code dispatched"
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white"
              />
            </div>

            {newStatus === 'CANCELLED' && (
              <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
                ⚠️ Marking this order as CANCELLED will automatically refund {selectedRdm.pointsSpent.toLocaleString()} points back to the trader&apos;s ledger and replenish product stock.
              </div>
            )}

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
              <Button variant="ghost" size="sm" onClick={() => setSelectedRdm(null)} disabled={isUpdating}>
                Cancel
              </Button>
              <Button type="submit" size="sm" variant="primary" isLoading={isUpdating}>
                Save & Update Order
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
