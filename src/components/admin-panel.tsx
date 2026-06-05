'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import {
  Users, ListTodo, Megaphone, Vault, Shield, Settings, Image as ImageIcon,
  Loader2, Plus, Trash2, Ban, Search, Save, BarChart3
} from 'lucide-react';

interface AdminPanelProps {
  open: boolean;
  onClose: () => void;
}

export function AdminPanel({ open, onClose }: AdminPanelProps) {
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState('stats');

  if (!user?.isAdmin) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-card border-border/50 max-w-2xl max-h-[90vh] p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            Admin Panel
          </DialogTitle>
        </DialogHeader>

        <div className="p-6 pt-2">
          <Tabs value={activeSection} onValueChange={setActiveSection}>
            <TabsList className="flex flex-wrap gap-1 bg-secondary/30 h-auto p-1 mb-4">
              <TabsTrigger value="stats" className="text-xs gap-1"><BarChart3 className="w-3 h-3" />Stats</TabsTrigger>
              <TabsTrigger value="users" className="text-xs gap-1"><Users className="w-3 h-3" />Users</TabsTrigger>
              <TabsTrigger value="tasks" className="text-xs gap-1"><ListTodo className="w-3 h-3" />Tasks</TabsTrigger>
              <TabsTrigger value="announcements" className="text-xs gap-1"><Megaphone className="w-3 h-3" />News</TabsTrigger>
              <TabsTrigger value="vault" className="text-xs gap-1"><Vault className="w-3 h-3" />Vault</TabsTrigger>
              <TabsTrigger value="roles" className="text-xs gap-1"><Shield className="w-3 h-3" />Roles</TabsTrigger>
              <TabsTrigger value="settings" className="text-xs gap-1"><Settings className="w-3 h-3" />Config</TabsTrigger>
              <TabsTrigger value="ads" className="text-xs gap-1"><ImageIcon className="w-3 h-3" />Ads</TabsTrigger>
            </TabsList>

            <ScrollArea className="max-h-[60vh]">
              <TabsContent value="stats"><StatsSection userId={user.id} /></TabsContent>
              <TabsContent value="users"><UsersSection userId={user.id} /></TabsContent>
              <TabsContent value="tasks"><TasksSection userId={user.id} /></TabsContent>
              <TabsContent value="announcements"><AnnouncementsSection userId={user.id} /></TabsContent>
              <TabsContent value="vault"><VaultSection userId={user.id} /></TabsContent>
              <TabsContent value="roles"><RolesSection userId={user.id} /></TabsContent>
              <TabsContent value="settings"><SettingsSection userId={user.id} /></TabsContent>
              <TabsContent value="ads"><AdsSection userId={user.id} /></TabsContent>
            </ScrollArea>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Helper hook for admin data fetching
function useAdminFetch<T>(section: string, userId: string, extraParams: string = '') {
  const [data, setData] = useState<T | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [fetching, setFetching] = useState(false);

  const loading = data === null || fetching;

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/admin?section=${section}&userId=${userId}${extraParams}`)
      .then(res => res.json())
      .then(result => {
        if (!cancelled) setData(result);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setFetching(false);
      });
    return () => { cancelled = true; };
  }, [section, userId, extraParams, refreshKey]);

  const refresh = () => {
    setFetching(true);
    setRefreshKey(k => k + 1);
  };

  return { data, loading, refresh };
}

// Stats Section
function StatsSection({ userId }: { userId: string }) {
  const { data, loading } = useAdminFetch<{ stats: Record<string, unknown> }>('stats', userId);

  if (loading || !data) return <LoadingSpinner />;

  const stats = data.stats;
  const statItems = [
    { label: 'Total Users', value: (stats?.totalUsers as number) || 0, icon: Users },
    { label: 'Active Miners', value: (stats?.activeMiners as number) || 0, icon: Shield },
    { label: 'Total NXR', value: ((stats?.totalNxR as number) || 0).toLocaleString(), icon: BarChart3 },
    { label: 'Tasks Completed', value: (stats?.totalTasks as number) || 0, icon: ListTodo },
    { label: 'Total Referrals', value: (stats?.totalReferrals as number) || 0, icon: Users },
  ];

  return (
    <div className="grid grid-cols-2 gap-3">
      {statItems.map((item) => (
        <Card key={item.label} className="bg-secondary/30 border-border/30">
          <CardContent className="p-3 flex items-center gap-2">
            <item.icon className="w-4 h-4 text-primary" />
            <div>
              <p className="text-lg font-bold text-foreground">{item.value}</p>
              <p className="text-[10px] text-muted-foreground">{item.label}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// Users Section
function UsersSection({ userId }: { userId: string }) {
  const [search, setSearch] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const { data, loading, refresh } = useAdminFetch<{ users: Array<Record<string, unknown>> }>('users', userId, searchTerm ? `&search=${searchTerm}` : '');
  const { toast } = useToast();

  const users = data?.users || [];

  const handleBan = async (targetId: string, ban: boolean) => {
    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'ban_user', adminId: userId, targetUserId: targetId, ban }),
      });
      const result = await res.json();
      if (res.ok) {
        toast({ title: ban ? 'User banned' : 'User unbanned' });
        refresh();
      } else {
        toast({ title: 'Error', description: result.error, variant: 'destructive' });
      }
    } catch {
      toast({ title: 'Error', variant: 'destructive' });
    }
  };

  const doSearch = () => {
    setSearchTerm(search);
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && doSearch()}
            className="pl-10 bg-secondary/50 border-border/50"
          />
        </div>
        <Button size="sm" variant="outline" onClick={doSearch}>Search</Button>
      </div>

      {loading ? <LoadingSpinner /> : (
        <div className="space-y-2">
          {users.map((u) => (
            <Card key={u.id as string} className="bg-secondary/20 border-border/30">
              <CardContent className="p-3 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs text-primary font-bold">
                  {(u.name as string)?.[0]?.toUpperCase() || '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{u.name as string}</p>
                  <p className="text-xs text-muted-foreground">{u.email as string}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-medium text-foreground">{(u.nxrBalance as number)?.toFixed(0)} NXR</p>
                  {(u.role as Record<string, unknown>)?.name && <p className="text-[10px] text-muted-foreground">{(u.role as Record<string, unknown>)?.name as string}</p>}
                </div>
                <Button
                  size="sm"
                  variant={u.isBanned ? 'outline' : 'destructive'}
                  className="text-xs h-7"
                  onClick={() => handleBan(u.id as string, !u.isBanned)}
                >
                  <Ban className="w-3 h-3 mr-1" />
                  {u.isBanned ? 'Unban' : 'Ban'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// Tasks Section
function TasksSection({ userId }: { userId: string }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', type: 'social', url: '', nxrReward: '20', vaultReward: '0.02' });
  const { data, loading, refresh } = useAdminFetch<{ tasks: Array<Record<string, unknown>> }>('tasks', userId);
  const { toast } = useToast();

  const tasks = data?.tasks || [];

  const handleCreate = async () => {
    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create_task', adminId: userId,
          title: form.title, description: form.description, type: form.type,
          url: form.url, nxrReward: parseFloat(form.nxrReward), vaultReward: parseFloat(form.vaultReward),
        }),
      });
      if (res.ok) {
        toast({ title: 'Task created' });
        setShowForm(false);
        setForm({ title: '', description: '', type: 'social', url: '', nxrReward: '20', vaultReward: '0.02' });
        refresh();
      }
    } catch {
      toast({ title: 'Error', variant: 'destructive' });
    }
  };

  const handleDelete = async (taskId: string) => {
    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete_task', adminId: userId, taskId }),
      });
      if (res.ok) {
        toast({ title: 'Task deleted' });
        refresh();
      }
    } catch {
      toast({ title: 'Error', variant: 'destructive' });
    }
  };

  const handleToggle = async (taskId: string, isActive: boolean) => {
    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update_task', adminId: userId, taskId, isActive: !isActive }),
      });
      if (res.ok) {
        toast({ title: 'Task updated' });
        refresh();
      }
    } catch {
      toast({ title: 'Error', variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{tasks.length} tasks</span>
        <Button size="sm" className="bg-primary" onClick={() => setShowForm(!showForm)}>
          <Plus className="w-4 h-4 mr-1" /> New
        </Button>
      </div>

      {showForm && (
        <Card className="bg-secondary/20 border-border/30">
          <CardContent className="p-3 space-y-2">
            <Input placeholder="Task title" value={form.title} onChange={(e) => setForm({...form, title: e.target.value})} className="bg-secondary/50 border-border/50 text-sm" />
            <Input placeholder="Description" value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} className="bg-secondary/50 border-border/50 text-sm" />
            <Input placeholder="URL" value={form.url} onChange={(e) => setForm({...form, url: e.target.value})} className="bg-secondary/50 border-border/50 text-sm" />
            <div className="grid grid-cols-2 gap-2">
              <Input placeholder="NXR Reward" type="number" value={form.nxrReward} onChange={(e) => setForm({...form, nxrReward: e.target.value})} className="bg-secondary/50 border-border/50 text-sm" />
              <Input placeholder="Vault Reward" type="number" step="0.01" value={form.vaultReward} onChange={(e) => setForm({...form, vaultReward: e.target.value})} className="bg-secondary/50 border-border/50 text-sm" />
            </div>
            <div className="flex gap-2">
              <Button size="sm" className="bg-primary flex-1" onClick={handleCreate}>Create</Button>
              <Button size="sm" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {loading ? <LoadingSpinner /> : (
        <div className="space-y-2">
          {tasks.map((task) => (
            <Card key={task.id as string} className="bg-secondary/20 border-border/30">
              <CardContent className="p-3 flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{task.title as string}</p>
                  <p className="text-xs text-muted-foreground">{task.nxrReward as number} NXR • ${(task.vaultReward as number).toFixed(2)} vault</p>
                </div>
                <Switch checked={task.isActive as boolean} onCheckedChange={() => handleToggle(task.id as string, task.isActive as boolean)} />
                <Button size="sm" variant="ghost" className="text-destructive h-7 w-7 p-0" onClick={() => handleDelete(task.id as string)}>
                  <Trash2 className="w-3 h-3" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// Announcements Section
function AnnouncementsSection({ userId }: { userId: string }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', message: '', isImportant: false });
  const { data, loading, refresh } = useAdminFetch<{ announcements: Array<Record<string, unknown>> }>('announcements', userId);
  const { toast } = useToast();

  const announcements = data?.announcements || [];

  const handleCreate = async () => {
    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'create_announcement', adminId: userId, ...form }),
      });
      if (res.ok) {
        toast({ title: 'Announcement created & notifications sent' });
        setShowForm(false);
        setForm({ title: '', message: '', isImportant: false });
        refresh();
      }
    } catch {
      toast({ title: 'Error', variant: 'destructive' });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete_announcement', adminId: userId, announcementId: id }),
      });
      if (res.ok) { toast({ title: 'Deleted' }); refresh(); }
    } catch { toast({ title: 'Error', variant: 'destructive' }); }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{announcements.length} announcements</span>
        <Button size="sm" className="bg-primary" onClick={() => setShowForm(!showForm)}>
          <Plus className="w-4 h-4 mr-1" /> New
        </Button>
      </div>

      {showForm && (
        <Card className="bg-secondary/20 border-border/30">
          <CardContent className="p-3 space-y-2">
            <Input placeholder="Title" value={form.title} onChange={(e) => setForm({...form, title: e.target.value})} className="bg-secondary/50 border-border/50 text-sm" />
            <Textarea placeholder="Message" value={form.message} onChange={(e) => setForm({...form, message: e.target.value})} className="bg-secondary/50 border-border/50 text-sm" rows={3} />
            <div className="flex items-center gap-2">
              <Switch checked={form.isImportant} onCheckedChange={(v) => setForm({...form, isImportant: v})} />
              <Label className="text-xs text-muted-foreground">Important</Label>
            </div>
            <div className="flex gap-2">
              <Button size="sm" className="bg-primary flex-1" onClick={handleCreate}>Send</Button>
              <Button size="sm" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {loading ? <LoadingSpinner /> : (
        <div className="space-y-2">
          {announcements.map((ann) => (
            <Card key={ann.id as string} className="bg-secondary/20 border-border/30">
              <CardContent className="p-3">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">{ann.title as string}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{ann.message as string}</p>
                    {ann.isImportant && <span className="text-[10px] text-primary">Important</span>}
                  </div>
                  <Button size="sm" variant="ghost" className="text-destructive h-7 w-7 p-0" onClick={() => handleDelete(ann.id as string)}>
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// Vault Section
function VaultSection({ userId }: { userId: string }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', totalPool: '10000' });
  const { data, loading, refresh } = useAdminFetch<{ campaigns: Array<Record<string, unknown>> }>('vault_campaigns', userId);
  const { toast } = useToast();

  const campaigns = data?.campaigns || [];

  const handleCreate = async () => {
    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'create_vault_campaign', adminId: userId, ...form, totalPool: parseFloat(form.totalPool) }),
      });
      if (res.ok) { toast({ title: 'Campaign created' }); setShowForm(false); refresh(); }
    } catch { toast({ title: 'Error', variant: 'destructive' }); }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{campaigns.length} campaigns</span>
        <Button size="sm" className="bg-primary" onClick={() => setShowForm(!showForm)}>
          <Plus className="w-4 h-4 mr-1" /> New
        </Button>
      </div>

      {showForm && (
        <Card className="bg-secondary/20 border-border/30">
          <CardContent className="p-3 space-y-2">
            <Input placeholder="Campaign title" value={form.title} onChange={(e) => setForm({...form, title: e.target.value})} className="bg-secondary/50 border-border/50 text-sm" />
            <Textarea placeholder="Description" value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} className="bg-secondary/50 border-border/50 text-sm" rows={2} />
            <Input placeholder="Total Pool" type="number" value={form.totalPool} onChange={(e) => setForm({...form, totalPool: e.target.value})} className="bg-secondary/50 border-border/50 text-sm" />
            <div className="flex gap-2">
              <Button size="sm" className="bg-primary flex-1" onClick={handleCreate}>Create</Button>
              <Button size="sm" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {loading ? <LoadingSpinner /> : (
        <div className="space-y-2">
          {campaigns.map((c) => (
            <Card key={c.id as string} className="bg-secondary/20 border-border/30">
              <CardContent className="p-3">
                <p className="text-sm font-medium text-foreground">{c.title as string}</p>
                <p className="text-xs text-muted-foreground">{c.description as string}</p>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-xs text-primary">Pool: {(c.totalPool as number).toLocaleString()}</span>
                  <span className="text-xs text-muted-foreground">{(c._count as Record<string, number>)?.vaultRewards || 0} rewards</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// Roles Section
function RolesSection({ userId }: { userId: string }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', minReferrals: '0', miningBoost: '1.0', color: '#2563EB' });
  const { data, loading, refresh } = useAdminFetch<{ roles: Array<Record<string, unknown>> }>('roles', userId);
  const { toast } = useToast();

  const roles = data?.roles || [];

  const handleCreate = async () => {
    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create_role', adminId: userId,
          name: form.name, minReferrals: parseInt(form.minReferrals),
          miningBoost: parseFloat(form.miningBoost), color: form.color,
        }),
      });
      if (res.ok) { toast({ title: 'Role created' }); setShowForm(false); refresh(); }
    } catch { toast({ title: 'Error', variant: 'destructive' }); }
  };

  const handleDelete = async (roleId: string) => {
    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete_role', adminId: userId, roleId }),
      });
      const result = await res.json();
      if (res.ok) { toast({ title: 'Role deleted' }); refresh(); }
      else { toast({ title: 'Error', description: result.error, variant: 'destructive' }); }
    } catch { toast({ title: 'Error', variant: 'destructive' }); }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{roles.length} roles</span>
        <Button size="sm" className="bg-primary" onClick={() => setShowForm(!showForm)}>
          <Plus className="w-4 h-4 mr-1" /> New
        </Button>
      </div>

      {showForm && (
        <Card className="bg-secondary/20 border-border/30">
          <CardContent className="p-3 space-y-2">
            <Input placeholder="Role name" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} className="bg-secondary/50 border-border/50 text-sm" />
            <div className="grid grid-cols-2 gap-2">
              <Input placeholder="Min Referrals" type="number" value={form.minReferrals} onChange={(e) => setForm({...form, minReferrals: e.target.value})} className="bg-secondary/50 border-border/50 text-sm" />
              <Input placeholder="Mining Boost" type="number" step="0.1" value={form.miningBoost} onChange={(e) => setForm({...form, miningBoost: e.target.value})} className="bg-secondary/50 border-border/50 text-sm" />
            </div>
            <div className="flex items-center gap-2">
              <Input type="color" value={form.color} onChange={(e) => setForm({...form, color: e.target.value})} className="w-10 h-8 p-0 border-0" />
              <Input value={form.color} onChange={(e) => setForm({...form, color: e.target.value})} className="bg-secondary/50 border-border/50 text-sm" />
            </div>
            <div className="flex gap-2">
              <Button size="sm" className="bg-primary flex-1" onClick={handleCreate}>Create</Button>
              <Button size="sm" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {loading ? <LoadingSpinner /> : (
        <div className="space-y-2">
          {roles.map((role) => (
            <Card key={role.id as string} className="bg-secondary/20 border-border/30">
              <CardContent className="p-3 flex items-center gap-3">
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: role.color as string }} />
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">{role.name as string}</p>
                  <p className="text-xs text-muted-foreground">{role.minReferrals as number} refs • {(role.miningBoost as number)}x boost</p>
                </div>
                <span className="text-xs text-muted-foreground">{(role._count as Record<string, number>)?.users || 0} users</span>
                <Button size="sm" variant="ghost" className="text-destructive h-7 w-7 p-0" onClick={() => handleDelete(role.id as string)}>
                  <Trash2 className="w-3 h-3" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// Settings Section
function SettingsSection({ userId }: { userId: string }) {
  const { data, loading } = useAdminFetch<{ settings: Array<Record<string, string>> }>('settings', userId);
  const [settings, setSettings] = useState<Array<Record<string, string>>>([]);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (data?.settings) {
      setSettings(data.settings);
    }
  }, [data]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_settings', adminId: userId,
          settings: settings.map(s => ({ key: s.key, value: s.value, description: s.description })),
        }),
      });
      if (res.ok) { toast({ title: 'Settings saved' }); }
    } catch { toast({ title: 'Error', variant: 'destructive' }); }
    finally { setSaving(false); }
  };

  if (loading || settings.length === 0) return <LoadingSpinner />;

  return (
    <div className="space-y-3">
      {settings.map((setting, i) => (
        <div key={setting.key} className="space-y-1">
          <Label className="text-xs text-muted-foreground">{setting.key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</Label>
          <Input
            value={setting.value}
            onChange={(e) => {
              const next = [...settings];
              next[i] = { ...next[i], value: e.target.value };
              setSettings(next);
            }}
            className="bg-secondary/50 border-border/50 text-sm"
          />
          <p className="text-[10px] text-muted-foreground">{setting.description}</p>
        </div>
      ))}
      <Button className="w-full bg-primary" onClick={handleSave} disabled={saving}>
        {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
        Save Settings
      </Button>
    </div>
  );
}

// Ads Section
function AdsSection({ userId }: { userId: string }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ position: 'home_banner', adType: 'banner', title: '', imageUrl: '', linkUrl: '', htmlCode: '' });
  const { data, loading, refresh } = useAdminFetch<{ ads: Array<Record<string, unknown>> }>('ads', userId);
  const { toast } = useToast();

  const ads = data?.ads || [];

  const handleCreate = async () => {
    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'create_ad', adminId: userId, ...form }),
      });
      if (res.ok) { toast({ title: 'Ad created' }); setShowForm(false); refresh(); }
    } catch { toast({ title: 'Error', variant: 'destructive' }); }
  };

  const handleDelete = async (adId: string) => {
    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete_ad', adminId: userId, adId }),
      });
      if (res.ok) { toast({ title: 'Ad deleted' }); refresh(); }
    } catch { toast({ title: 'Error', variant: 'destructive' }); }
  };

  const handleToggle = async (adId: string, isActive: boolean) => {
    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update_ad', adminId: userId, adId, isActive: !isActive }),
      });
      if (res.ok) { toast({ title: 'Ad updated' }); refresh(); }
    } catch { toast({ title: 'Error', variant: 'destructive' }); }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{ads.length} ad placements</span>
        <Button size="sm" className="bg-primary" onClick={() => setShowForm(!showForm)}>
          <Plus className="w-4 h-4 mr-1" /> New
        </Button>
      </div>

      {showForm && (
        <Card className="bg-secondary/20 border-border/30">
          <CardContent className="p-3 space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs text-muted-foreground">Position</Label>
                <Input placeholder="home_banner" value={form.position} onChange={(e) => setForm({...form, position: e.target.value})} className="bg-secondary/50 border-border/50 text-sm" />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Type</Label>
                <Input placeholder="banner" value={form.adType} onChange={(e) => setForm({...form, adType: e.target.value})} className="bg-secondary/50 border-border/50 text-sm" />
              </div>
            </div>
            <Input placeholder="Ad title" value={form.title} onChange={(e) => setForm({...form, title: e.target.value})} className="bg-secondary/50 border-border/50 text-sm" />
            <Input placeholder="Image URL" value={form.imageUrl} onChange={(e) => setForm({...form, imageUrl: e.target.value})} className="bg-secondary/50 border-border/50 text-sm" />
            <Input placeholder="Link URL" value={form.linkUrl} onChange={(e) => setForm({...form, linkUrl: e.target.value})} className="bg-secondary/50 border-border/50 text-sm" />
            <Textarea placeholder="Custom HTML code (for AdSense, etc.)" value={form.htmlCode} onChange={(e) => setForm({...form, htmlCode: e.target.value})} className="bg-secondary/50 border-border/50 text-sm" rows={3} />
            <div className="flex gap-2">
              <Button size="sm" className="bg-primary flex-1" onClick={handleCreate}>Create</Button>
              <Button size="sm" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {loading ? <LoadingSpinner /> : (
        <div className="space-y-2">
          {ads.map((ad) => (
            <Card key={ad.id as string} className="bg-secondary/20 border-border/30">
              <CardContent className="p-3">
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">{ad.title as string || 'Untitled'}</p>
                    <p className="text-xs text-muted-foreground">{ad.position as string} • {ad.adType as string}</p>
                  </div>
                  <Switch checked={ad.isActive as boolean} onCheckedChange={() => handleToggle(ad.id as string, ad.isActive as boolean)} />
                  <Button size="sm" variant="ghost" className="text-destructive h-7 w-7 p-0" onClick={() => handleDelete(ad.id as string)}>
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function LoadingSpinner() {
  return (
    <div className="flex justify-center py-8">
      <Loader2 className="w-6 h-6 animate-spin text-primary" />
    </div>
  );
}
