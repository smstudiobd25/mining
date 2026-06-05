'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, LayoutDashboard, Users, ListTodo, Megaphone, Gift, Shield, Settings, Image, Save, Trash2, Ban, CheckCircle, Plus, ToggleLeft, ToggleRight, Send } from 'lucide-react';
import { useAdminData, useAdminAction } from '@/hooks/use-app-data';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const tabs = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'users', label: 'Users', icon: Users },
  { id: 'tasks', label: 'Tasks', icon: ListTodo },
  { id: 'announcements', label: 'Announce', icon: Megaphone },
  { id: 'vault_campaigns', label: 'Vault', icon: Gift },
  { id: 'roles', label: 'Roles', icon: Shield },
  { id: 'settings', label: 'Settings', icon: Settings },
  { id: 'ads', label: 'Ads', icon: Image },
];

export function AdminPanel({ isOpen, onClose }: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const adminAction = useAdminAction();

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[95] bg-[#0A0F1C] flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <Shield className="w-5 h-5 text-[#2563EB]" />
              Admin Panel
            </h2>
            <button onClick={onClose} className="text-muted-foreground hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tab navigation */}
          <div className="flex overflow-x-auto border-b border-border px-2 gap-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium whitespace-nowrap border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-[#2563EB] text-[#2563EB]'
                      : 'border-transparent text-muted-foreground hover:text-white'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4">
            {activeTab === 'dashboard' && <DashboardTab />}
            {activeTab === 'users' && <UsersTab adminAction={adminAction} />}
            {activeTab === 'tasks' && <TasksTab adminAction={adminAction} />}
            {activeTab === 'announcements' && <AnnouncementsTab adminAction={adminAction} />}
            {activeTab === 'vault_campaigns' && <VaultTab adminAction={adminAction} />}
            {activeTab === 'roles' && <RolesTab adminAction={adminAction} />}
            {activeTab === 'settings' && <SettingsTab adminAction={adminAction} />}
            {activeTab === 'ads' && <AdsTab adminAction={adminAction} />}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Dashboard Tab
function DashboardTab() {
  const { data, isLoading } = useAdminData('dashboard');

  if (isLoading) return <LoadingSpinner />;

  const stats = [
    { label: 'Total Users', value: data?.totalUsers ?? 0, icon: Users, color: '#2563EB' },
    { label: 'Active Miners', value: data?.activeMiners ?? 0, icon: Shield, color: '#7C3AED' },
    { label: 'Total NXR', value: (data?.totalNxr ?? 0).toLocaleString(), icon: Gift, color: '#F59E0B' },
    { label: 'Tasks Done', value: data?.totalTasksCompleted ?? 0, icon: ListTodo, color: '#06B6D4' },
    { label: 'Banned', value: data?.bannedUsers ?? 0, icon: Ban, color: '#EF4444' },
    { label: 'Referrals', value: data?.totalReferrals ?? 0, icon: Users, color: '#10B981' },
  ];

  return (
    <div className="grid grid-cols-2 gap-3">
      {stats.map((stat) => (
        <div key={stat.label} className="rounded-xl p-4 bg-card border border-border">
          <stat.icon className="w-5 h-5 mb-2" style={{ color: stat.color }} />
          <p className="text-2xl font-bold text-white">{stat.value}</p>
          <p className="text-xs text-muted-foreground">{stat.label}</p>
        </div>
      ))}
    </div>
  );
}

// Users Tab
function UsersTab({ adminAction }: { adminAction: ReturnType<typeof useAdminAction> }) {
  const { data, isLoading } = useAdminData('users');
  const [search, setSearch] = useState('');

  if (isLoading) return <LoadingSpinner />;

  const users = (data?.users || []).filter((u: { name: string; email: string }) =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-3">
      <Input
        placeholder="Search users..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="bg-secondary border-border text-white"
      />
      <div className="space-y-2 max-h-[60vh] overflow-y-auto">
        {users.map((user: {
          id: string;
          name: string;
          email: string;
          isBanned: boolean;
          isAdmin: boolean;
          nxrBalance: number;
          role: { name: string; icon: string; color: string } | null;
          _count: { referralsMade: number; taskCompletions: number };
        }) => (
          <div key={user.id} className="rounded-xl p-3 bg-card border border-border">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-white truncate">
                  {user.name}
                  {user.isAdmin && <span className="text-[#2563EB] text-xs ml-1">Admin</span>}
                  {user.isBanned && <span className="text-destructive text-xs ml-1">Banned</span>}
                </p>
                <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-[#2563EB]">{user.nxrBalance.toLocaleString()} NXR</span>
                  <span className="text-xs text-muted-foreground">
                    {user.role?.icon} {user.role?.name}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {user.isBanned ? (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => adminAction.mutate({ section: 'users', action: 'unban', data: { id: user.id } })}
                    className="text-green-500 border-green-500/30 text-xs"
                  >
                    <CheckCircle className="w-3 h-3" />
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => adminAction.mutate({ section: 'users', action: 'ban', data: { id: user.id } })}
                    className="text-destructive border-destructive/30 text-xs"
                  >
                    <Ban className="w-3 h-3" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Tasks Tab
function TasksTab({ adminAction }: { adminAction: ReturnType<typeof useAdminAction> }) {
  const { data, isLoading } = useAdminData('tasks');
  const [showNew, setShowNew] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', description: '', type: 'social', url: '', nxrReward: 20, vaultReward: 0.02 });

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="space-y-3">
      <Button
        onClick={() => setShowNew(!showNew)}
        className="w-full bg-[#2563EB] hover:bg-[#1D4ED8] text-white"
      >
        <Plus className="w-4 h-4 mr-1" />
        New Task
      </Button>

      {showNew && (
        <div className="rounded-xl p-4 bg-card border border-border space-y-3">
          <Input placeholder="Title" value={newTask.title} onChange={(e) => setNewTask({ ...newTask, title: e.target.value })} className="bg-secondary border-border text-white" />
          <Input placeholder="Description" value={newTask.description} onChange={(e) => setNewTask({ ...newTask, description: e.target.value })} className="bg-secondary border-border text-white" />
          <div className="grid grid-cols-2 gap-2">
            <Input placeholder="NXR Reward" type="number" value={newTask.nxrReward} onChange={(e) => setNewTask({ ...newTask, nxrReward: parseFloat(e.target.value) || 0 })} className="bg-secondary border-border text-white" />
            <Input placeholder="Vault Reward" type="number" step="0.01" value={newTask.vaultReward} onChange={(e) => setNewTask({ ...newTask, vaultReward: parseFloat(e.target.value) || 0 })} className="bg-secondary border-border text-white" />
          </div>
          <Input placeholder="URL" value={newTask.url} onChange={(e) => setNewTask({ ...newTask, url: e.target.value })} className="bg-secondary border-border text-white" />
          <div className="flex gap-2">
            <Button onClick={() => { adminAction.mutate({ section: 'tasks', action: 'create', data: newTask }); setShowNew(false); }} className="flex-1 bg-[#2563EB] text-white text-sm">Create</Button>
            <Button onClick={() => setShowNew(false)} variant="outline" className="flex-1 border-border text-sm">Cancel</Button>
          </div>
        </div>
      )}

      <div className="space-y-2 max-h-[50vh] overflow-y-auto">
        {(data?.tasks || []).map((task: {
          id: string;
          title: string;
          nxrReward: number;
          vaultReward: number;
          isActive: boolean;
          _count: { completions: number };
        }) => (
          <div key={task.id} className="rounded-xl p-3 bg-card border border-border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white">{task.title}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-[#2563EB]">+{task.nxrReward} NXR</span>
                  <span className="text-xs text-[#F59E0B]">+${task.vaultReward} Vault</span>
                  <span className="text-xs text-muted-foreground">{task._count.completions} done</span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => adminAction.mutate({ section: 'tasks', action: 'toggle', data: { id: task.id } })}
                  className="text-muted-foreground hover:text-white"
                >
                  {task.isActive ? <ToggleRight className="w-5 h-5 text-green-500" /> : <ToggleLeft className="w-5 h-5" />}
                </button>
                <button
                  onClick={() => adminAction.mutate({ section: 'tasks', action: 'delete', data: { id: task.id } })}
                  className="text-destructive hover:text-red-400"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Announcements Tab
function AnnouncementsTab({ adminAction }: { adminAction: ReturnType<typeof useAdminAction> }) {
  const { data, isLoading } = useAdminData('announcements');
  const [showNew, setShowNew] = useState(false);
  const [newAnn, setNewAnn] = useState({ title: '', message: '', isImportant: false, notifyAll: true });

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="space-y-3">
      <Button onClick={() => setShowNew(!showNew)} className="w-full bg-[#2563EB] hover:bg-[#1D4ED8] text-white">
        <Plus className="w-4 h-4 mr-1" />
        New Announcement
      </Button>

      {showNew && (
        <div className="rounded-xl p-4 bg-card border border-border space-y-3">
          <Input placeholder="Title" value={newAnn.title} onChange={(e) => setNewAnn({ ...newAnn, title: e.target.value })} className="bg-secondary border-border text-white" />
          <Textarea placeholder="Message" value={newAnn.message} onChange={(e) => setNewAnn({ ...newAnn, message: e.target.value })} className="bg-secondary border-border text-white min-h-[80px]" />
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Switch checked={newAnn.isImportant} onCheckedChange={(v) => setNewAnn({ ...newAnn, isImportant: v })} />
              <Label className="text-sm text-muted-foreground">Important</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={newAnn.notifyAll} onCheckedChange={(v) => setNewAnn({ ...newAnn, notifyAll: v })} />
              <Label className="text-sm text-muted-foreground">Notify All</Label>
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => { adminAction.mutate({ section: 'announcements', action: 'create', data: newAnn }); setShowNew(false); }} className="flex-1 bg-[#2563EB] text-white text-sm">
              <Send className="w-3 h-3 mr-1" />
              Publish
            </Button>
            <Button onClick={() => setShowNew(false)} variant="outline" className="flex-1 border-border text-sm">Cancel</Button>
          </div>
        </div>
      )}

      <div className="space-y-2 max-h-[50vh] overflow-y-auto">
        {(data?.announcements || []).map((ann: {
          id: string;
          title: string;
          message: string;
          isImportant: boolean;
          isActive: boolean;
        }) => (
          <div key={ann.id} className="rounded-xl p-3 bg-card border border-border">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <p className="text-sm font-medium text-white truncate">{ann.title}</p>
                  {ann.isImportant && <span className="text-[10px] bg-[#F59E0B]/20 text-[#F59E0B] px-1.5 py-0.5 rounded-full">Important</span>}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{ann.message}</p>
              </div>
              <div className="flex items-center gap-1 ml-2">
                <button
                  onClick={() => adminAction.mutate({ section: 'announcements', action: 'toggle', data: { id: ann.id } })}
                  className="text-muted-foreground hover:text-white"
                >
                  {ann.isActive ? <ToggleRight className="w-5 h-5 text-green-500" /> : <ToggleLeft className="w-5 h-5" />}
                </button>
                <button onClick={() => adminAction.mutate({ section: 'announcements', action: 'delete', data: { id: ann.id } })} className="text-destructive">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Vault Tab
function VaultTab({ adminAction }: { adminAction: ReturnType<typeof useAdminAction> }) {
  const { data, isLoading } = useAdminData('vault_campaigns');
  const [showNew, setShowNew] = useState(false);
  const [newCamp, setNewCamp] = useState({ title: '', description: '', totalPool: 0 });

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="space-y-3">
      <Button onClick={() => setShowNew(!showNew)} className="w-full bg-[#2563EB] hover:bg-[#1D4ED8] text-white">
        <Plus className="w-4 h-4 mr-1" /> New Campaign
      </Button>

      {showNew && (
        <div className="rounded-xl p-4 bg-card border border-border space-y-3">
          <Input placeholder="Title" value={newCamp.title} onChange={(e) => setNewCamp({ ...newCamp, title: e.target.value })} className="bg-secondary border-border text-white" />
          <Input placeholder="Description" value={newCamp.description} onChange={(e) => setNewCamp({ ...newCamp, description: e.target.value })} className="bg-secondary border-border text-white" />
          <Input placeholder="Total Pool" type="number" value={newCamp.totalPool} onChange={(e) => setNewCamp({ ...newCamp, totalPool: parseFloat(e.target.value) || 0 })} className="bg-secondary border-border text-white" />
          <div className="flex gap-2">
            <Button onClick={() => { adminAction.mutate({ section: 'vault_campaigns', action: 'create', data: newCamp }); setShowNew(false); }} className="flex-1 bg-[#2563EB] text-white text-sm">Create</Button>
            <Button onClick={() => setShowNew(false)} variant="outline" className="flex-1 border-border text-sm">Cancel</Button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {(data?.campaigns || []).map((camp: {
          id: string;
          title: string;
          description: string;
          totalPool: number;
          isActive: boolean;
          _count: { vaultRewards: number };
        }) => (
          <div key={camp.id} className="rounded-xl p-3 bg-card border border-border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white">{camp.title}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-[#F59E0B]">Pool: ${camp.totalPool}</span>
                  <span className="text-xs text-muted-foreground">{camp._count.vaultRewards} rewards</span>
                </div>
              </div>
              <button onClick={() => adminAction.mutate({ section: 'vault_campaigns', action: 'delete', data: { id: camp.id } })} className="text-destructive">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Roles Tab
function RolesTab({ adminAction }: { adminAction: ReturnType<typeof useAdminAction> }) {
  const { data, isLoading } = useAdminData('roles');

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="space-y-2">
      {(data?.roles || []).map((role: {
        id: string;
        name: string;
        minReferrals: number;
        miningBoost: number;
        color: string;
        icon: string;
        _count: { users: number };
      }) => (
        <div key={role.id} className="rounded-xl p-3 bg-card border border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-lg">{role.icon}</span>
              <div>
                <p className="text-sm font-medium text-white">{role.name}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-muted-foreground">{role.minReferrals} refs</span>
                  <span className="text-xs text-muted-foreground">{role.miningBoost}x boost</span>
                  <span className="text-xs text-muted-foreground">{role._count.users} users</span>
                </div>
              </div>
            </div>
            <div className="w-5 h-5 rounded-full border border-border" style={{ backgroundColor: role.color }} />
          </div>
        </div>
      ))}
    </div>
  );
}

// Settings Tab
function SettingsTab({ adminAction }: { adminAction: ReturnType<typeof useAdminAction> }) {
  const { data, isLoading } = useAdminData('settings');
  const [localSettings, setLocalSettings] = useState<Record<string, string>>({});

  React.useEffect(() => {
    if (data?.settings) {
      const map: Record<string, string> = {};
      for (const s of data.settings) {
        map[s.key] = s.value;
      }
      setLocalSettings(map);
    }
  }, [data]);

  if (isLoading) return <LoadingSpinner />;

  const categories: Record<string, Array<{ key: string; description: string }>> = {};
  for (const s of data?.settings || []) {
    if (!categories[s.category]) categories[s.category] = [];
    categories[s.category].push({ key: s.key, description: s.description });
  }

  const handleSave = () => {
    const settings = Object.entries(localSettings).map(([key, value]) => ({ key, value }));
    adminAction.mutate({ section: 'settings', action: 'update', data: { settings } });
  };

  return (
    <div className="space-y-4">
      {Object.entries(categories).map(([category, items]) => (
        <div key={category} className="rounded-xl p-4 bg-card border border-border">
          <h4 className="text-sm font-semibold text-white mb-3 capitalize">{category}</h4>
          <div className="space-y-3">
            {items.map((item) => (
              <div key={item.key} className="space-y-1">
                <label className="text-xs text-muted-foreground">{item.key.replace(/_/g, ' ')}</label>
                <Input
                  value={localSettings[item.key] ?? ''}
                  onChange={(e) => setLocalSettings({ ...localSettings, [item.key]: e.target.value })}
                  className="bg-secondary border-border text-white text-sm"
                />
                <p className="text-[10px] text-muted-foreground/60">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      ))}

      <Button onClick={handleSave} className="w-full bg-[#2563EB] hover:bg-[#1D4ED8] text-white">
        <Save className="w-4 h-4 mr-2" />
        Save All Settings
      </Button>
    </div>
  );
}

// Ads Tab
function AdsTab({ adminAction }: { adminAction: ReturnType<typeof useAdminAction> }) {
  const { data, isLoading } = useAdminData('ads');
  const [showNew, setShowNew] = useState(false);
  const [newAd, setNewAd] = useState({ position: 'home_banner', adType: 'banner', title: '', imageUrl: '', linkUrl: '', htmlCode: '', isActive: true });

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="space-y-3">
      <Button onClick={() => setShowNew(!showNew)} className="w-full bg-[#2563EB] hover:bg-[#1D4ED8] text-white">
        <Plus className="w-4 h-4 mr-1" /> New Ad Placement
      </Button>

      {showNew && (
        <div className="rounded-xl p-4 bg-card border border-border space-y-3">
          <Input placeholder="Position (home_banner, earn_banner, profile_banner)" value={newAd.position} onChange={(e) => setNewAd({ ...newAd, position: e.target.value })} className="bg-secondary border-border text-white" />
          <Input placeholder="Title" value={newAd.title} onChange={(e) => setNewAd({ ...newAd, title: e.target.value })} className="bg-secondary border-border text-white" />
          <Input placeholder="Image URL" value={newAd.imageUrl} onChange={(e) => setNewAd({ ...newAd, imageUrl: e.target.value })} className="bg-secondary border-border text-white" />
          <Input placeholder="Link URL" value={newAd.linkUrl} onChange={(e) => setNewAd({ ...newAd, linkUrl: e.target.value })} className="bg-secondary border-border text-white" />
          <Textarea placeholder="Custom HTML Code (for AdSense, etc.)" value={newAd.htmlCode} onChange={(e) => setNewAd({ ...newAd, htmlCode: e.target.value })} className="bg-secondary border-border text-white min-h-[80px]" />
          <div className="flex gap-2">
            <Button onClick={() => { adminAction.mutate({ section: 'ads', action: 'create', data: newAd }); setShowNew(false); }} className="flex-1 bg-[#2563EB] text-white text-sm">Create</Button>
            <Button onClick={() => setShowNew(false)} variant="outline" className="flex-1 border-border text-sm">Cancel</Button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {(data?.ads || []).map((ad: {
          id: string;
          position: string;
          title: string;
          adType: string;
          isActive: boolean;
          _count: { adViews: number };
        }) => (
          <div key={ad.id} className="rounded-xl p-3 bg-card border border-border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white">{ad.title || ad.position}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-muted-foreground">{ad.position}</span>
                  <span className="text-xs text-muted-foreground">{ad.adType}</span>
                  <span className="text-xs text-muted-foreground">{ad._count.adViews} views</span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => adminAction.mutate({ section: 'ads', action: 'toggle', data: { id: ad.id } })}
                  className="text-muted-foreground hover:text-white"
                >
                  {ad.isActive ? <ToggleRight className="w-5 h-5 text-green-500" /> : <ToggleLeft className="w-5 h-5" />}
                </button>
                <button onClick={() => adminAction.mutate({ section: 'ads', action: 'delete', data: { id: ad.id } })} className="text-destructive">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function LoadingSpinner() {
  return (
    <div className="flex justify-center py-12">
      <div className="w-6 h-6 border-2 border-[#2563EB]/30 border-t-[#2563EB] rounded-full animate-spin" />
    </div>
  );
}
