'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Settings, Save, CheckCircle2 } from 'lucide-react';

interface SystemSetting {
  id: string;
  key: string;
  value: string;
  description?: string;
  updatedAt: string;
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SystemSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fetchSettings = () => {
    setLoading(true);
    api
      .get<SystemSetting[]>('/admin/settings')
      .then((data) => setSettings(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleUpdate = async (key: string, value: string) => {
    setSavingKey(key);
    setSuccessMsg(null);
    try {
      await api.put(`/admin/settings/${key}`, { value });
      setSuccessMsg(`Setting '${key}' updated successfully!`);
      setTimeout(() => setSuccessMsg(null), 3000);
      fetchSettings();
    } catch (err: any) {
      alert(err.message || 'Failed to update setting');
    } finally {
      setSavingKey(null);
    }
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight">System Settings</h1>
        <p className="text-xs text-slate-400">
          Global platform parameters, threshold rules, and support contact configurations.
        </p>
      </div>

      {successMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4" />
          <span>{successMsg}</span>
        </div>
      )}

      <Card className="p-6 space-y-6 border-slate-800 bg-slate-900/60">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
          <Settings className="h-5 w-5 text-purple-400" />
          <h3 className="font-bold text-white text-base">Global Configuration Keys</h3>
        </div>

        {loading ? (
          <div className="py-8 text-center text-xs text-slate-400">Loading settings...</div>
        ) : (
          <div className="space-y-4">
            {settings.map((setting) => (
              <div
                key={setting.key}
                className="p-4 rounded-xl border border-slate-800 bg-slate-950 space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-white text-sm">
                    {setting.key}
                  </span>
                  <span className="text-[11px] text-slate-500">
                    {setting.description || 'System parameter'}
                  </span>
                </div>

                <div className="flex items-center gap-3 pt-1">
                  <input
                    type="text"
                    defaultValue={setting.value}
                    id={`input-${setting.key}`}
                    className="flex-1 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white focus:border-purple-500 focus:outline-none"
                  />
                  <Button
                    size="sm"
                    variant="primary"
                    isLoading={savingKey === setting.key}
                    onClick={() => {
                      const input = document.getElementById(`input-${setting.key}`) as HTMLInputElement;
                      if (input) handleUpdate(setting.key, input.value);
                    }}
                  >
                    <Save className="h-3.5 w-3.5 mr-1" />
                    Save
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
