'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, LayoutDashboard, Users, ListTodo, Megaphone, Gift, Shield, Settings, Image, Save, Trash2, Ban, CheckCircle, Plus, ToggleLeft, ToggleRight, Send, TrendingUp, Activity, Crown, Zap, Eye, ChevronRight, KeyRound } from 'lucide-react';
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
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, color: '#3B82F6' },
  { id: 'users', label: 'Users', icon: Users, color: '#8B5CF6' },
  { id: 'tasks', label: 'Tasks', icon: ListTodo, color: '#06B6D4' },
  { id: 'announcements', label: 'Announce', icon: Megaphone, color: '#F59E0B' },
  { id: 'vault_campaigns', label: 'Vault', icon: Gift, color: '#10B981' },
  { id: 'roles', label: 'Roles', icon: Shield, color: '#EC4899' },
  { id: 'settings', label: 'Settings', icon: Settings, color: '#6366F1' },
  { id: 'ads', label: 'Ads', icon: Image, color: '#F97316' },
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
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[95] flex flex-col admin-panel-bg overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 admin-header-border relative">
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-0 left-1/4 w-32 h-16 bg-blue-500/5 rounded-full blur-2xl" />
              <div className="absolute top-0 right-1/4 w-24 h-12 bg-purple-500/5 rounded-full blur-2xl" />
            </div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2.5 relative">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)',
                  boxShadow: '0 0 20px rgba(59,130,246,0.3), 0 0 40px rgba(139,92,246,0.15)',
                }}>
                <Shield className="w-4 h-4 text-white" />
              </div>
              <span className="text-gradient-blue">Admin Panel</span>
            </h2>
            <button onClick={onClose}
              className="text-muted-foreground/50 hover:text-white p-2 rounded-xl hover:bg-white/5 transition-all relative">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tab navigation */}
          <div className="flex overflow-x-auto admin-tabs-border px-3 gap-1.5 py-2 relative">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-semibold whitespace-nowrap rounded-xl transition-all duration-200 ${
                    isActive
                      ? 'admin-tab-active'
                      : 'text-muted-foreground/50 hover:text-white hover:bg-white/[0.03]'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" style={isActive ? { color: tab.color } : undefined} />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {activeTab === 'dashboard' && <DashboardTab />}
                {activeTab === 'users' && <UsersTab adminAction={adminAction} />}
                {activeTab === 'tasks' && <TasksTab adminAction={adminAction} />}
                {activeTab === 'announcements' && <AnnouncementsTab adminAction={adminAction} />}
                {activeTab === 'vault_campaigns' && <VaultTab adminAction={adminAction} />}
                {activeTab === 'roles' && <RolesTab adminAction={adminAction} />}
                {activeTab === 'settings' && <SettingsTab adminAction={adminAction} />}
                {activeTab === 'ads' && <AdsTab adminAction={adminAction} />}
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Dashboard Tab - Hyper Style
function DashboardTab() {
  const { data, isLoading } = useAdminData('dashboard');

  if (isLoading) return <LoadingSpinner />;

  const stats = [
    { label: 'Total Users', value: data?.totalUsers ?? 0, icon: Users, color: '#3B82F6', gradient: 'from-blue-500/20 to-blue-600/5', glow: 'rgba(59,130,246,0.15)' },
    { label: 'Active Miners', value: data?.activeMiners ?? 0, icon: Activity, color: '#8B5CF6', gradient: 'from-purple-500/20 to-purple-600/5', glow: 'rgba(139,92,246,0.15)' },
    { label: 'Total NXR', value: (data?.totalNxr ?? 0).toLocaleString(), icon: TrendingUp, color: '#F59E0B', gradient: 'from-yellow-500/20 to-yellow-600/5', glow: 'rgba(245,158,11,0.15)' },
    { label: 'Tasks Done', value: data?.totalTasksCompleted ?? 0, icon: ListTodo, color: '#06B6D4', gradient: 'from-cyan-500/20 to-cyan-600/5', glow: 'rgba(6,182,212,0.15)' },
    { label: 'Banned', value: data?.bannedUsers ?? 0, icon: Ban, color: '#EF4444', gradient: 'from-red-500/20 to-red-600/5', glow: 'rgba(239,68,68,0.15)' },
    { label: 'Referrals', value: data?.totalReferrals ?? 0, icon: Zap, color: '#10B981', gradient: 'from-emerald-500/20 to-emerald-600/5', glow: 'rgba(16,185,129,0.15)' },
  ];

  return (
    <div className="space-y-5">
      {/* Welcome banner */}
      <div className="admin-welcome-banner rounded-2xl p-5 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500/8 rounded-full blur-3xl" />
        </div>
        <div className="relative">
          <div className="flex items-center gap-2 mb-1">
            <Crown className="w-5 h-5 text-yellow-400" />
            <h3 className="text-lg font-bold text-white">Admin Dashboard</h3>
          </div>
          <p className="text-muted-foreground/60 text-sm">Monitor and manage your Nexora Network platform</p>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="admin-stat-card rounded-2xl p-4 relative overflow-hidden group"
          >
            {/* Color accent glow */}
            <div className="absolute top-0 right-0 w-20 h-20 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              style={{ background: stat.glow }} />
            <div className="relative">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                style={{
                  background: `linear-gradient(135deg, ${stat.color}20, ${stat.color}08)`,
                  border: `1px solid ${stat.color}15`,
                }}>
                <stat.icon className="w-5 h-5" style={{ color: stat.color }} />
              </div>
              <p className="text-2xl font-black text-white mb-0.5">{stat.value}</p>
              <p className="text-xs text-muted-foreground/60 font-medium">{stat.label}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// Users Tab - Hyper Style
function UsersTab({ adminAction }: { adminAction: ReturnType<typeof useAdminAction> }) {
  const { data, isLoading } = useAdminData('users');
  const [search, setSearch] = useState('');
  const [changePassUser, setChangePassUser] = useState<{ id: string; name: string } | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [passError, setPassError] = useState('');
  const [passSuccess, setPassSuccess] = useState(false);

  if (isLoading) return <LoadingSpinner />;

  const users = (data?.users || []).filter((u: { name: string; email: string }) =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleChangePassword = () => {
    setPassError('');
    setPassSuccess(false);
    if (!newPassword || newPassword.length < 6) {
      setPassError('Password must be at least 6 characters');
      return;
    }
    adminAction.mutate(
      { section: 'users', action: 'changePassword', data: { id: changePassUser!.id, newPassword } },
      {
        onSuccess: () => {
          setPassSuccess(true);
          setNewPassword('');
          setTimeout(() => {
            setChangePassUser(null);
            setPassSuccess(false);
          }, 1500);
        },
        onError: () => {
          setPassError('Failed to change password');
        },
      }
    );
  };

  return (
    <div className="space-y-3">
      <div className="relative group">
        <Users className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-400/50 group-focus-within:text-blue-400 transition-colors" />
        <Input
          placeholder="Search users..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 admin-input-hyper rounded-xl h-11"
        />
      </div>
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
        }, i: number) => (
          <motion.div
            key={user.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.02 }}
            className="admin-item-card rounded-xl p-3.5 group hover:border-blue-500/20 transition-all"
          >
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold"
                    style={{
                      background: user.isAdmin
                        ? 'linear-gradient(135deg, rgba(59,130,246,0.2), rgba(139,92,246,0.15))'
                        : 'rgba(255,255,255,0.05)',
                      border: `1px solid ${user.isAdmin ? 'rgba(59,130,246,0.2)' : 'rgba(255,255,255,0.06)'}`,
                      color: user.isAdmin ? '#60A5FA' : '#94A3B8',
                    }}>
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-white truncate">
                      {user.name}
                      {user.isAdmin && <span className="text-[10px] ml-1.5 px-1.5 py-0.5 rounded-full bg-blue-500/15 text-blue-400 font-bold">ADMIN</span>}
                      {user.isBanned && <span className="text-[10px] ml-1.5 px-1.5 py-0.5 rounded-full bg-red-500/15 text-red-400 font-bold">BANNED</span>}
                    </p>
                    <p className="text-xs text-muted-foreground/50 truncate">{user.email}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs font-semibold text-blue-400">{user.nxrBalance.toLocaleString()} NXR</span>
                      {user.role && (
                        <span className="text-xs text-muted-foreground/40 flex items-center gap-1">
                          <span>{user.role.icon}</span> {user.role.name}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1 ml-2">
                {/* Change Password Button */}
                <button
                  onClick={() => { setChangePassUser({ id: user.id, name: user.name }); setNewPassword(''); setPassError(''); setPassSuccess(false); }}
                  className="p-1.5 rounded-lg hover:bg-blue-500/10 text-muted-foreground/40 hover:text-blue-400 transition-all"
                  title="Change Password"
                >
                  <KeyRound className="w-4 h-4" />
                </button>
                {user.isBanned ? (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => adminAction.mutate({ section: 'users', action: 'unban', data: { id: user.id } })}
                    className="admin-btn-success text-xs h-8 px-3"
                  >
                    <CheckCircle className="w-3.5 h-3.5 mr-1" />
                    Unban
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => adminAction.mutate({ section: 'users', action: 'ban', data: { id: user.id } })}
                    className="admin-btn-danger text-xs h-8 px-3"
                  >
                    <Ban className="w-3.5 h-3.5 mr-1" />
                    Ban
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Change Password Modal */}
      <AnimatePresence>
        {changePassUser && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center z-[100] p-4"
            style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }}
            onClick={() => setChangePassUser(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              onClick={(e) => e.stopPropagation()}
              className="admin-create-card rounded-2xl p-5 w-full max-w-sm space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                    style={{
                      background: 'linear-gradient(135deg, rgba(59,130,246,0.2), rgba(139,92,246,0.15))',
                      border: '1px solid rgba(59,130,246,0.2)',
                    }}>
                    <KeyRound className="w-4 h-4 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Change Password</h3>
                    <p className="text-[10px] text-muted-foreground/50">{changePassUser.name}</p>
                  </div>
                </div>
                <button onClick={() => setChangePassUser(null)}
                  className="text-muted-foreground/40 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-all">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {passSuccess ? (
                <motion.div
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  className="text-center py-4"
                >
                  <div className="w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center"
                    style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.2)' }}>
                    <CheckCircle className="w-6 h-6 text-emerald-400" />
                  </div>
                  <p className="text-white font-bold">Password Changed!</p>
                </motion.div>
              ) : (
                <>
                  <div className="space-y-2">
                    <label className="text-xs text-muted-foreground/60 font-medium">New Password</label>
                    <Input
                      type="text"
                      placeholder="Enter new password (min 6 chars)"
                      value={newPassword}
                      onChange={(e) => { setNewPassword(e.target.value); setPassError(''); }}
                      className="admin-input-hyper rounded-xl h-11"
                    />
                  </div>
                  {passError && (
                    <p className="text-xs text-red-400 font-medium">{passError}</p>
                  )}
                  <div className="flex gap-2">
                    <Button onClick={handleChangePassword} className="flex-1 btn-hyper-ultra text-white text-sm h-10 rounded-xl">
                      <KeyRound className="w-3.5 h-3.5 mr-1.5" />
                      Change Password
                    </Button>
                    <Button onClick={() => setChangePassUser(null)} variant="outline" className="flex-1 admin-btn-ghost text-sm h-10 rounded-xl">
                      Cancel
                    </Button>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Tasks Tab - Hyper Style
function TasksTab({ adminAction }: { adminAction: ReturnType<typeof useAdminAction> }) {
  const { data, isLoading } = useAdminData('tasks');
  const [showNew, setShowNew] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', description: '', type: 'social', url: '', nxrReward: 20, vaultReward: 0.02, notifyUsers: true });

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="space-y-3">
      <Button onClick={() => setShowNew(!showNew)} className="w-full btn-hyper-ultra text-white h-11 rounded-xl text-sm">
        <Plus className="w-4 h-4 mr-1.5" />
        New Task
      </Button>

      <AnimatePresence>
        {showNew && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="admin-create-card rounded-2xl p-4 space-y-3"
          >
            <Input placeholder="Title" value={newTask.title} onChange={(e) => setNewTask({ ...newTask, title: e.target.value })} className="admin-input-hyper rounded-xl" />
            <Input placeholder="Description" value={newTask.description} onChange={(e) => setNewTask({ ...newTask, description: e.target.value })} className="admin-input-hyper rounded-xl" />
            <div className="grid grid-cols-2 gap-2">
              <Input placeholder="NXR Reward" type="number" value={newTask.nxrReward} onChange={(e) => setNewTask({ ...newTask, nxrReward: parseFloat(e.target.value) || 0 })} className="admin-input-hyper rounded-xl" />
              <Input placeholder="Vault Reward" type="number" step="0.01" value={newTask.vaultReward} onChange={(e) => setNewTask({ ...newTask, vaultReward: parseFloat(e.target.value) || 0 })} className="admin-input-hyper rounded-xl" />
            </div>
            <Input placeholder="URL" value={newTask.url} onChange={(e) => setNewTask({ ...newTask, url: e.target.value })} className="admin-input-hyper rounded-xl" />
            <div className="flex items-center gap-3 py-1">
              <Switch checked={newTask.notifyUsers} onCheckedChange={(v) => setNewTask({ ...newTask, notifyUsers: v })} />
              <div>
                <Label className="text-sm text-white font-medium">Notify All Users</Label>
                <p className="text-[10px] text-muted-foreground/50">Send notification about this new task</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => { adminAction.mutate({ section: 'tasks', action: 'create', data: newTask }); setShowNew(false); }} className="flex-1 btn-hyper-ultra text-white text-sm h-10 rounded-xl">
                Create
              </Button>
              <Button onClick={() => setShowNew(false)} variant="outline" className="flex-1 admin-btn-ghost text-sm h-10 rounded-xl">Cancel</Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-2 max-h-[50vh] overflow-y-auto">
        {(data?.tasks || []).map((task: {
          id: string;
          title: string;
          nxrReward: number;
          vaultReward: number;
          isActive: boolean;
          _count: { completions: number };
        }, i: number) => (
          <motion.div
            key={task.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.02 }}
            className="admin-item-card rounded-xl p-3.5 group hover:border-cyan-500/20 transition-all"
          >
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{
                      background: task.isActive ? 'rgba(6,182,212,0.12)' : 'rgba(255,255,255,0.04)',
                      border: `1px solid ${task.isActive ? 'rgba(6,182,212,0.15)' : 'rgba(255,255,255,0.06)'}`,
                    }}>
                    <ListTodo className="w-4 h-4" style={{ color: task.isActive ? '#06B6D4' : '#64748B' }} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{task.title}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs font-semibold text-blue-400">+{task.nxrReward} NXR</span>
                      <span className="text-xs font-semibold text-yellow-400">+${task.vaultReward} Vault</span>
                      <span className="text-xs text-muted-foreground/40">{task._count.completions} done</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1.5 ml-2">
                <button
                  onClick={() => adminAction.mutate({ section: 'tasks', action: 'toggle', data: { id: task.id } })}
                  className="p-1.5 rounded-lg hover:bg-white/5 transition-colors"
                >
                  {task.isActive ? <ToggleRight className="w-5 h-5 text-emerald-400" /> : <ToggleLeft className="w-5 h-5 text-muted-foreground/40" />}
                </button>
                <button
                  onClick={() => adminAction.mutate({ section: 'tasks', action: 'delete', data: { id: task.id } })}
                  className="p-1.5 rounded-lg hover:bg-red-500/10 text-muted-foreground/40 hover:text-red-400 transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// Announcements Tab - Hyper Style
function AnnouncementsTab({ adminAction }: { adminAction: ReturnType<typeof useAdminAction> }) {
  const { data, isLoading } = useAdminData('announcements');
  const [showNew, setShowNew] = useState(false);
  const [newAnn, setNewAnn] = useState({ title: '', message: '', isImportant: false, notifyAll: true });

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="space-y-3">
      <Button onClick={() => setShowNew(!showNew)} className="w-full btn-hyper-ultra text-white h-11 rounded-xl text-sm">
        <Plus className="w-4 h-4 mr-1.5" />
        New Announcement
      </Button>

      <AnimatePresence>
        {showNew && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="admin-create-card rounded-2xl p-4 space-y-3"
          >
            <Input placeholder="Title" value={newAnn.title} onChange={(e) => setNewAnn({ ...newAnn, title: e.target.value })} className="admin-input-hyper rounded-xl" />
            <Textarea placeholder="Message" value={newAnn.message} onChange={(e) => setNewAnn({ ...newAnn, message: e.target.value })} className="admin-input-hyper rounded-xl min-h-[80px]" />
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
              <Button onClick={() => { adminAction.mutate({ section: 'announcements', action: 'create', data: newAnn }); setShowNew(false); }} className="flex-1 btn-hyper-ultra text-white text-sm h-10 rounded-xl">
                <Send className="w-3.5 h-3.5 mr-1.5" />
                Publish
              </Button>
              <Button onClick={() => setShowNew(false)} variant="outline" className="flex-1 admin-btn-ghost text-sm h-10 rounded-xl">Cancel</Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-2 max-h-[50vh] overflow-y-auto">
        {(data?.announcements || []).map((ann: {
          id: string;
          title: string;
          message: string;
          isImportant: boolean;
          isActive: boolean;
        }, i: number) => (
          <motion.div
            key={ann.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.02 }}
            className="admin-item-card rounded-xl p-3.5 group hover:border-yellow-500/20 transition-all"
          >
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{
                      background: ann.isImportant ? 'rgba(245,158,11,0.12)' : 'rgba(255,255,255,0.04)',
                      border: `1px solid ${ann.isImportant ? 'rgba(245,158,11,0.15)' : 'rgba(255,255,255,0.06)'}`,
                    }}>
                    <Megaphone className="w-4 h-4" style={{ color: ann.isImportant ? '#F59E0B' : '#64748B' }} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <p className="text-sm font-semibold text-white truncate">{ann.title}</p>
                      {ann.isImportant && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-yellow-500/15 text-yellow-400 font-bold whitespace-nowrap">IMPORTANT</span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground/50 mt-0.5 line-clamp-2">{ann.message}</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1.5 ml-2">
                <button
                  onClick={() => adminAction.mutate({ section: 'announcements', action: 'toggle', data: { id: ann.id } })}
                  className="p-1.5 rounded-lg hover:bg-white/5 transition-colors"
                >
                  {ann.isActive ? <ToggleRight className="w-5 h-5 text-emerald-400" /> : <ToggleLeft className="w-5 h-5 text-muted-foreground/40" />}
                </button>
                <button onClick={() => adminAction.mutate({ section: 'announcements', action: 'delete', data: { id: ann.id } })}
                  className="p-1.5 rounded-lg hover:bg-red-500/10 text-muted-foreground/40 hover:text-red-400 transition-all">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// Vault Tab - Hyper Style
function VaultTab({ adminAction }: { adminAction: ReturnType<typeof useAdminAction> }) {
  const { data, isLoading } = useAdminData('vault_campaigns');
  const [showNew, setShowNew] = useState(false);
  const [newCamp, setNewCamp] = useState({ title: '', description: '', totalPool: 0 });

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="space-y-3">
      <Button onClick={() => setShowNew(!showNew)} className="w-full btn-hyper-ultra text-white h-11 rounded-xl text-sm">
        <Plus className="w-4 h-4 mr-1.5" />
        New Campaign
      </Button>

      <AnimatePresence>
        {showNew && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="admin-create-card rounded-2xl p-4 space-y-3"
          >
            <Input placeholder="Title" value={newCamp.title} onChange={(e) => setNewCamp({ ...newCamp, title: e.target.value })} className="admin-input-hyper rounded-xl" />
            <Input placeholder="Description" value={newCamp.description} onChange={(e) => setNewCamp({ ...newCamp, description: e.target.value })} className="admin-input-hyper rounded-xl" />
            <Input placeholder="Total Pool" type="number" value={newCamp.totalPool} onChange={(e) => setNewCamp({ ...newCamp, totalPool: parseFloat(e.target.value) || 0 })} className="admin-input-hyper rounded-xl" />
            <div className="flex gap-2">
              <Button onClick={() => { adminAction.mutate({ section: 'vault_campaigns', action: 'create', data: newCamp }); setShowNew(false); }} className="flex-1 btn-hyper-ultra text-white text-sm h-10 rounded-xl">Create</Button>
              <Button onClick={() => setShowNew(false)} variant="outline" className="flex-1 admin-btn-ghost text-sm h-10 rounded-xl">Cancel</Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-2">
        {(data?.campaigns || []).map((camp: {
          id: string;
          title: string;
          description: string;
          totalPool: number;
          isActive: boolean;
          _count: { vaultRewards: number };
        }, i: number) => (
          <motion.div
            key={camp.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.02 }}
            className="admin-item-card rounded-xl p-3.5 group hover:border-emerald-500/20 transition-all"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{
                    background: 'rgba(16,185,129,0.12)',
                    border: '1px solid rgba(16,185,129,0.15)',
                  }}>
                  <Gift className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{camp.title}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs font-semibold text-yellow-400">Pool: ${camp.totalPool}</span>
                    <span className="text-xs text-muted-foreground/40">{camp._count.vaultRewards} rewards</span>
                  </div>
                </div>
              </div>
              <button onClick={() => adminAction.mutate({ section: 'vault_campaigns', action: 'delete', data: { id: camp.id } })}
                className="p-1.5 rounded-lg hover:bg-red-500/10 text-muted-foreground/40 hover:text-red-400 transition-all">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// Roles Tab - Hyper Style
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
      }, i: number) => (
        <motion.div
          key={role.id}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.04 }}
          className="admin-item-card rounded-xl p-4 group hover:border-pink-500/20 transition-all relative overflow-hidden"
        >
          {/* Role color accent */}
          <div className="absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-500"
            style={{ background: role.color }} />
          <div className="flex items-center justify-between relative">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                style={{
                  background: `${role.color}15`,
                  border: `1px solid ${role.color}20`,
                  boxShadow: `0 0 20px ${role.color}10`,
                }}>
                {role.icon}
              </div>
              <div>
                <p className="text-sm font-bold text-white">{role.name}</p>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-xs text-muted-foreground/60 flex items-center gap-1">
                    <Users className="w-3 h-3" /> {role.minReferrals} refs
                  </span>
                  <span className="text-xs text-blue-400 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" /> {role.miningBoost}x boost
                  </span>
                  <span className="text-xs text-muted-foreground/60">{role._count.users} users</span>
                </div>
              </div>
            </div>
            <div className="w-6 h-6 rounded-lg border border-border/50"
              style={{ backgroundColor: role.color, boxShadow: `0 0 12px ${role.color}30` }} />
          </div>
        </motion.div>
      ))}
    </div>
  );
}

// Settings Tab - Hyper Style
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
      {Object.entries(categories).map(([category, items], ci) => (
        <motion.div
          key={category}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: ci * 0.05 }}
          className="admin-create-card rounded-2xl p-4"
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-indigo-500/10 border border-indigo-500/15">
              <Settings className="w-3.5 h-3.5 text-indigo-400" />
            </div>
            <h4 className="text-sm font-bold text-white capitalize">{category}</h4>
          </div>
          <div className="space-y-3">
            {items.map((item) => (
              <div key={item.key} className="space-y-1.5">
                <label className="text-xs text-muted-foreground/70 font-medium">{item.key.replace(/_/g, ' ')}</label>
                <Input
                  value={localSettings[item.key] ?? ''}
                  onChange={(e) => setLocalSettings({ ...localSettings, [item.key]: e.target.value })}
                  className="admin-input-hyper rounded-xl text-sm h-10"
                />
                <p className="text-[10px] text-muted-foreground/40">{item.description}</p>
              </div>
            ))}
          </div>
        </motion.div>
      ))}

      <Button onClick={handleSave} className="w-full btn-hyper-ultra text-white h-12 rounded-xl font-bold">
        <Save className="w-4 h-4 mr-2" />
        Save All Settings
      </Button>
    </div>
  );
}

// Ads Tab - Hyper Style
function AdsTab({ adminAction }: { adminAction: ReturnType<typeof useAdminAction> }) {
  const { data, isLoading } = useAdminData('ads');
  const [showNew, setShowNew] = useState(false);
  const [newAd, setNewAd] = useState({ position: 'home_banner', adType: 'banner', title: '', imageUrl: '', linkUrl: '', htmlCode: '', isActive: true });

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="space-y-3">
      <Button onClick={() => setShowNew(!showNew)} className="w-full btn-hyper-ultra text-white h-11 rounded-xl text-sm">
        <Plus className="w-4 h-4 mr-1.5" />
        New Ad Placement
      </Button>

      <AnimatePresence>
        {showNew && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="admin-create-card rounded-2xl p-4 space-y-3"
          >
            <Input placeholder="Position (home_banner, earn_banner, profile_banner)" value={newAd.position} onChange={(e) => setNewAd({ ...newAd, position: e.target.value })} className="admin-input-hyper rounded-xl" />
            <Input placeholder="Title" value={newAd.title} onChange={(e) => setNewAd({ ...newAd, title: e.target.value })} className="admin-input-hyper rounded-xl" />
            <Input placeholder="Image URL" value={newAd.imageUrl} onChange={(e) => setNewAd({ ...newAd, imageUrl: e.target.value })} className="admin-input-hyper rounded-xl" />
            <Input placeholder="Link URL" value={newAd.linkUrl} onChange={(e) => setNewAd({ ...newAd, linkUrl: e.target.value })} className="admin-input-hyper rounded-xl" />
            <Textarea placeholder="Custom HTML Code (for AdSense, etc.)" value={newAd.htmlCode} onChange={(e) => setNewAd({ ...newAd, htmlCode: e.target.value })} className="admin-input-hyper rounded-xl min-h-[80px]" />
            <div className="flex gap-2">
              <Button onClick={() => { adminAction.mutate({ section: 'ads', action: 'create', data: newAd }); setShowNew(false); }} className="flex-1 btn-hyper-ultra text-white text-sm h-10 rounded-xl">Create</Button>
              <Button onClick={() => setShowNew(false)} variant="outline" className="flex-1 admin-btn-ghost text-sm h-10 rounded-xl">Cancel</Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-2">
        {(data?.ads || []).map((ad: {
          id: string;
          position: string;
          title: string;
          adType: string;
          isActive: boolean;
          _count: { adViews: number };
        }, i: number) => (
          <motion.div
            key={ad.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.02 }}
            className="admin-item-card rounded-xl p-3.5 group hover:border-orange-500/20 transition-all"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{
                    background: 'rgba(249,115,22,0.12)',
                    border: '1px solid rgba(249,115,22,0.15)',
                  }}>
                  <Image className="w-4 h-4 text-orange-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{ad.title || ad.position}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-muted-foreground/50">{ad.position}</span>
                    <span className="text-xs text-orange-400">{ad.adType}</span>
                    <span className="text-xs text-muted-foreground/40 flex items-center gap-0.5">
                      <Eye className="w-3 h-3" /> {ad._count.adViews}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1.5 ml-2">
                <button
                  onClick={() => adminAction.mutate({ section: 'ads', action: 'toggle', data: { id: ad.id } })}
                  className="p-1.5 rounded-lg hover:bg-white/5 transition-colors"
                >
                  {ad.isActive ? <ToggleRight className="w-5 h-5 text-emerald-400" /> : <ToggleLeft className="w-5 h-5 text-muted-foreground/40" />}
                </button>
                <button onClick={() => adminAction.mutate({ section: 'ads', action: 'delete', data: { id: ad.id } })}
                  className="p-1.5 rounded-lg hover:bg-red-500/10 text-muted-foreground/40 hover:text-red-400 transition-all">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function LoadingSpinner() {
  return (
    <div className="flex justify-center py-16">
      <div className="relative">
        <div className="w-10 h-10 border-2 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
        <div className="absolute inset-0 w-10 h-10 border-2 border-transparent border-b-purple-500/40 rounded-full animate-spin"
          style={{ animationDuration: '1.5s', animationDirection: 'reverse' }} />
      </div>
    </div>
  );
}
