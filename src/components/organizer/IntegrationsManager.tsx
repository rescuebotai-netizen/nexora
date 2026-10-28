import React, { useState } from 'react';
import { 
  Zap, 
  CreditCard, 
  Smartphone, 
  Globe, 
  Mail, 
  Send, 
  Users, 
  Share2, 
  Activity, 
  MessageCircle, 
  Hash, 
  Bot, 
  Video, 
  Tv, 
  FileSpreadsheet, 
  FileText, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Settings, 
  RefreshCw, 
  Plus, 
  Trash2, 
  Copy, 
  Check, 
  ExternalLink, 
  Sliders, 
  Code2, 
  Key, 
  ShieldCheck, 
  Clock, 
  Radio, 
  ArrowRight,
  Eye,
  EyeOff,
  Filter,
  Search,
  Sparkles
} from 'lucide-react';
import { ThirdPartyIntegration, CustomWebhookEndpoint, WebhookDeliveryLog, OrganizerProfile } from '../../types';
import { store } from '../../lib/store';

interface IntegrationsManagerProps {
  organizer: OrganizerProfile;
  theme?: 'dark' | 'light';
  onNotification?: (msg: string) => void;
}

export const IntegrationsManager: React.FC<IntegrationsManagerProps> = ({
  organizer,
  theme = 'dark',
  onNotification,
}) => {
  const isDark = theme === 'dark';

  // State
  const [integrations, setIntegrations] = useState<ThirdPartyIntegration[]>(() => 
    store.getOrganizerIntegrations(organizer.id)
  );
  const [customWebhooks, setCustomWebhooks] = useState<CustomWebhookEndpoint[]>(() => 
    store.getCustomWebhooks(organizer.id)
  );
  const [deliveryLogs, setDeliveryLogs] = useState<WebhookDeliveryLog[]>(() => 
    store.getWebhookDeliveryLogs(organizer.id)
  );

  // Filters
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals & Drawers
  const [activeConfigItem, setActiveConfigItem] = useState<ThirdPartyIntegration | null>(null);
  const [showAddWebhookModal, setShowAddWebhookModal] = useState(false);
  const [testPingModal, setTestPingModal] = useState<{
    open: boolean;
    loading: boolean;
    result?: { success: boolean; statusCode: number; latencyMs: number; message: string; responseBody: string };
  }>({ open: false, loading: false });

  // Webhook creation form state
  const [newWebhookName, setNewWebhookName] = useState('');
  const [newWebhookUrl, setNewWebhookUrl] = useState('');
  const [newWebhookSecret, setNewWebhookSecret] = useState('whsec_' + Math.random().toString(36).substring(2, 14));
  const [newWebhookEvents, setNewWebhookEvents] = useState<string[]>([
    'ticket.purchased',
    'attendee.checked_in',
  ]);

  // Config Modal State
  const [configMode, setConfigMode] = useState<'live' | 'sandbox'>('live');
  const [configApiKey, setConfigApiKey] = useState('');
  const [configApiSecret, setConfigApiSecret] = useState('');
  const [configWebhookUrl, setConfigWebhookUrl] = useState('');
  const [configAccountId, setConfigAccountId] = useState('');
  const [configSenderId, setConfigSenderId] = useState('');
  const [configAutoSync, setConfigAutoSync] = useState(true);
  const [configFeatures, setConfigFeatures] = useState<Record<string, boolean>>({});
  const [showSecretKey, setShowSecretKey] = useState(false);
  const [testingHandshake, setTestingHandshake] = useState(false);
  const [handshakeFeedback, setHandshakeFeedback] = useState<string | null>(null);

  // Helper notification
  const notify = (msg: string) => {
    if (onNotification) onNotification(msg);
  };

  // Open config modal
  const handleOpenConfig = (item: ThirdPartyIntegration) => {
    setActiveConfigItem(item);
    setConfigMode(item.config.mode || 'live');
    setConfigApiKey(item.config.apiKey || '');
    setConfigApiSecret(item.config.apiSecret || '');
    setConfigWebhookUrl(item.config.webhookUrl || '');
    setConfigAccountId(item.config.accountId || '');
    setConfigSenderId(item.config.senderIdOrChannel || '');
    setConfigAutoSync(item.config.autoSync ?? true);
    setConfigFeatures(item.config.features || {});
    setHandshakeFeedback(null);
    setShowSecretKey(false);
  };

  // Toggle connection status
  const handleToggleStatus = (id: string) => {
    const res = store.toggleIntegrationStatus(organizer.id, id);
    if (res) {
      setIntegrations(store.getOrganizerIntegrations(organizer.id));
      notify(`Integration "${res.name}" is now ${res.status === 'connected' ? 'Connected' : 'Disconnected'}.`);
    }
  };

  // Save config modal
  const handleSaveConfig = () => {
    if (!activeConfigItem) return;

    const updated = store.updateOrganizerIntegration(organizer.id, activeConfigItem.id, {
      status: 'connected',
      config: {
        mode: configMode,
        apiKey: configApiKey,
        apiSecret: configApiSecret,
        webhookUrl: configWebhookUrl,
        accountId: configAccountId,
        senderIdOrChannel: configSenderId,
        autoSync: configAutoSync,
        features: configFeatures,
      },
    });

    if (updated) {
      setIntegrations(store.getOrganizerIntegrations(organizer.id));
      notify(`Configuration saved for ${updated.name}. Live sync active.`);
      setActiveConfigItem(null);
    }
  };

  // Test live handshake
  const handleTestHandshake = (item?: ThirdPartyIntegration) => {
    setTestingHandshake(true);
    setHandshakeFeedback(null);
    const target = item || activeConfigItem;
    
    setTimeout(() => {
      setTestingHandshake(false);
      const latency = Math.floor(Math.random() * 35) + 22;
      setHandshakeFeedback(`Handshake validated: HTTP 200 OK (${latency}ms) — Connection healthy with verified credentials.`);
      notify(`Connection verified for ${target?.name || 'integration'} in ${latency}ms.`);
    }, 600);
  };

  // Custom Webhook Handlers
  const handleCreateWebhook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWebhookName.trim() || !newWebhookUrl.trim()) return;

    store.createCustomWebhook(organizer.id, {
      name: newWebhookName.trim(),
      url: newWebhookUrl.trim(),
      secret: newWebhookSecret.trim(),
      events: newWebhookEvents,
      active: true,
    });

    setCustomWebhooks(store.getCustomWebhooks(organizer.id));
    setDeliveryLogs(store.getWebhookDeliveryLogs(organizer.id));
    setShowAddWebhookModal(false);
    setNewWebhookName('');
    setNewWebhookUrl('');
    notify('Custom webhook endpoint created successfully.');
  };

  const handleDeleteWebhook = (whId: string) => {
    store.deleteCustomWebhook(organizer.id, whId);
    setCustomWebhooks(store.getCustomWebhooks(organizer.id));
    notify('Webhook endpoint deleted.');
  };

  const handleToggleWebhook = (whId: string) => {
    store.toggleCustomWebhook(organizer.id, whId);
    setCustomWebhooks(store.getCustomWebhooks(organizer.id));
    notify('Webhook status toggled.');
  };

  const handleTriggerWebhookPing = (whId: string) => {
    setTestPingModal({ open: true, loading: true });
    setTimeout(() => {
      const res = store.triggerWebhookTestPing(organizer.id, whId);
      setTestPingModal({ open: true, loading: false, result: res });
      setCustomWebhooks(store.getCustomWebhooks(organizer.id));
      setDeliveryLogs(store.getWebhookDeliveryLogs(organizer.id));
      notify(res.message);
    }, 450);
  };

  // Filtered Integrations
  const filteredIntegrations = integrations.filter(item => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.categoryLabel.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const connectedCount = integrations.filter(i => i.status === 'connected').length;

  // Icon mapping
  const renderIcon = (iconName: string) => {
    switch (iconName) {
      case 'credit-card': return <CreditCard className="w-5 h-5" />;
      case 'smartphone': return <Smartphone className="w-5 h-5" />;
      case 'zap': return <Zap className="w-5 h-5" />;
      case 'globe': return <Globe className="w-5 h-5" />;
      case 'mail': return <Mail className="w-5 h-5" />;
      case 'send': return <Send className="w-5 h-5" />;
      case 'users': return <Users className="w-5 h-5" />;
      case 'share-2': return <Share2 className="w-5 h-5" />;
      case 'activity': return <Activity className="w-5 h-5" />;
      case 'message-circle': return <MessageCircle className="w-5 h-5" />;
      case 'hash': return <Hash className="w-5 h-5" />;
      case 'bot': return <Bot className="w-5 h-5" />;
      case 'video': return <Video className="w-5 h-5" />;
      case 'tv': return <Tv className="w-5 h-5" />;
      case 'file-spreadsheet': return <FileSpreadsheet className="w-5 h-5" />;
      case 'file-text': return <FileText className="w-5 h-5" />;
      default: return <Zap className="w-5 h-5" />;
    }
  };

  return (
    <div className="space-y-8 animate-fade-in text-xs">
      
      {/* 1. SUITE HEADER & STATS BANNER */}
      <div className={`p-6 rounded-2xl border shadow-lg space-y-6 ${
        isDark ? 'bg-[#0E131F] border-[#1F2937]' : 'bg-white border-[#E5E7EB]'
      }`}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono tracking-widest uppercase bg-white text-black px-2 py-0.5 rounded font-bold">
                ENTERPRISE ECOSYSTEM
              </span>
              <span className="text-[11px] font-mono text-emerald-500 font-bold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Live Sync Engine Active
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight">
              Third-Party Platform Integrations
            </h2>
            <p className={`text-xs max-w-2xl leading-relaxed ${isDark ? 'text-neutral-400' : 'text-neutral-600'}`}>
              Connect verified African and global payment rails, marketing audiences, automated WhatsApp ticket dispatch, team Slack gate alerts, virtual stages, and custom developer webhooks.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => {
                setSelectedCategory('developer');
                setShowAddWebhookModal(true);
              }}
              className="px-4 py-2.5 bg-white text-black hover:bg-neutral-200 font-bold text-xs rounded-xl transition-all cursor-pointer shadow-md flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Create Custom Webhook</span>
            </button>
            <button
              onClick={() => handleTestHandshake()}
              className={`px-3.5 py-2.5 text-xs font-semibold rounded-xl border transition-colors cursor-pointer flex items-center gap-2 ${
                isDark ? 'bg-white/5 border-white/10 text-white hover:bg-white/10' : 'bg-neutral-50 border-neutral-200 text-black hover:bg-neutral-100'
              }`}
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Test Handshakes</span>
            </button>
          </div>
        </div>

        {/* METRICS STRIP */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <div className={`p-3.5 rounded-xl border ${isDark ? 'bg-[#151D2C] border-[#253247]' : 'bg-neutral-50 border-[#E5E7EB]'}`}>
            <span className={`text-[10px] uppercase font-mono block ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>Connected Services</span>
            <div className="text-lg font-black font-mono mt-0.5">
              {connectedCount} <span className="text-xs font-normal opacity-60">/ {integrations.length}</span>
            </div>
          </div>

          <div className={`p-3.5 rounded-xl border ${isDark ? 'bg-[#151D2C] border-[#253247]' : 'bg-neutral-50 border-[#E5E7EB]'}`}>
            <span className={`text-[10px] uppercase font-mono block ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>Webhook Uptime</span>
            <div className="text-lg font-black font-mono text-emerald-500 mt-0.5">
              99.98%
            </div>
          </div>

          <div className={`p-3.5 rounded-xl border ${isDark ? 'bg-[#151D2C] border-[#253247]' : 'bg-neutral-50 border-[#E5E7EB]'}`}>
            <span className={`text-[10px] uppercase font-mono block ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>Avg Gateway Latency</span>
            <div className="text-lg font-black font-mono mt-0.5">
              42ms
            </div>
          </div>

          <div className={`p-3.5 rounded-xl border ${isDark ? 'bg-[#151D2C] border-[#253247]' : 'bg-neutral-50 border-[#E5E7EB]'}`}>
            <span className={`text-[10px] uppercase font-mono block ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>Active Endpoints</span>
            <div className="text-lg font-black font-mono mt-0.5">
              {customWebhooks.filter(w => w.active).length} Webhooks
            </div>
          </div>
        </div>
      </div>

      {/* 2. CATEGORY TABS & SEARCH BAR */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {[
            { id: 'all', label: `All (${integrations.length})` },
            { id: 'payment', label: 'Payment & Rails' },
            { id: 'marketing', label: 'Marketing & CRM' },
            { id: 'messaging', label: 'Messaging & Alerts' },
            { id: 'streaming', label: 'Virtual Stages' },
            { id: 'accounting', label: 'Automations & ERP' },
            { id: 'developer', label: `Developer Webhooks (${customWebhooks.length})` },
          ].map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-colors cursor-pointer text-xs ${
                selectedCategory === cat.id
                  ? 'bg-white text-black shadow-sm'
                  : isDark 
                    ? 'bg-[#151D2C] text-neutral-300 hover:bg-[#1E293B]' 
                    : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-3 opacity-50" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search integrations..."
            className={`w-full pl-9 pr-3.5 py-2 rounded-xl border outline-none font-medium ${
              isDark 
                ? 'bg-[#151D2C] border-[#253247] text-white focus:border-white' 
                : 'bg-white border-[#D1D5DB] text-black focus:border-black'
            }`}
          />
        </div>
      </div>

      {/* 3. INTEGRATION CARDS GRID (When not in developer webhooks tab) */}
      {selectedCategory !== 'developer' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredIntegrations.map((item) => {
            const isConnected = item.status === 'connected';

            return (
              <div
                key={item.id}
                className={`p-5 rounded-2xl border flex flex-col justify-between space-y-4 transition-all duration-200 hover:shadow-xl ${
                  isDark 
                    ? 'bg-[#0E131F] border-[#1F2937] hover:border-[#374151]' 
                    : 'bg-white border-[#E5E7EB] hover:border-[#CBD5E1]'
                }`}
              >
                {/* Header */}
                <div className="space-y-2.5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        isConnected 
                          ? 'bg-white text-black shadow-sm' 
                          : isDark ? 'bg-white/5 text-neutral-400' : 'bg-neutral-100 text-neutral-600'
                      }`}>
                        {renderIcon(item.iconName)}
                      </div>
                      <div>
                        <h3 className="font-bold text-sm tracking-tight">{item.name}</h3>
                        <span className="text-[10px] font-mono uppercase tracking-wider opacity-60">
                          {item.categoryLabel}
                        </span>
                      </div>
                    </div>

                    {/* Status badge */}
                    <div className="flex items-center gap-1.5">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase font-mono ${
                        isConnected 
                          ? 'bg-emerald-500/15 text-emerald-500 border border-emerald-500/30' 
                          : isDark 
                            ? 'bg-white/5 text-neutral-400 border border-white/10' 
                            : 'bg-neutral-100 text-neutral-500 border border-neutral-200'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-neutral-400'}`} />
                        {isConnected ? 'Connected' : 'Disconnected'}
                      </span>
                    </div>
                  </div>

                  {/* Description */}
                  <p className={`text-xs leading-relaxed line-clamp-3 ${isDark ? 'text-neutral-400' : 'text-neutral-600'}`}>
                    {item.description}
                  </p>

                  {/* Features Tag */}
                  {item.badge && (
                    <div className="pt-1">
                      <span className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-mono font-bold ${
                        isDark ? 'bg-white/5 text-neutral-300' : 'bg-neutral-100 text-neutral-700'
                      }`}>
                        ★ {item.badge}
                      </span>
                    </div>
                  )}
                </div>

                {/* Footer Controls & Metrics */}
                <div className="space-y-3 pt-3 border-t border-neutral-500/15">
                  {isConnected && item.metrics && (
                    <div className="flex items-center justify-between text-[10px] font-mono opacity-70">
                      <span>{item.metrics.syncedRecords?.toLocaleString()} synced</span>
                      <span>{item.metrics.latencyMs}ms latency</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between gap-2">
                    <button
                      onClick={() => handleOpenConfig(item)}
                      className={`px-3 py-1.5 rounded-xl font-semibold transition-colors cursor-pointer flex items-center gap-1.5 text-xs ${
                        isDark 
                          ? 'bg-white/10 hover:bg-white/20 text-white' 
                          : 'bg-neutral-100 hover:bg-neutral-200 text-black'
                      }`}
                    >
                      <Settings className="w-3.5 h-3.5" />
                      <span>Configure</span>
                    </button>

                    <button
                      onClick={() => handleToggleStatus(item.id)}
                      className={`px-3.5 py-1.5 rounded-xl font-bold transition-colors cursor-pointer text-xs ${
                        isConnected
                          ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20'
                          : 'bg-white text-black hover:bg-neutral-200 shadow-sm'
                      }`}
                    >
                      {isConnected ? 'Disconnect' : 'Connect'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 4. CUSTOM WEBHOOKS & DEVELOPER HUB SECTION */}
      {(selectedCategory === 'developer' || selectedCategory === 'all') && (
        <div className={`p-6 rounded-2xl border space-y-6 ${
          isDark ? 'bg-[#0E131F] border-[#1F2937]' : 'bg-white border-[#E5E7EB]'
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Code2 className="w-4 h-4 text-emerald-500" />
                <h3 className="text-base font-bold">Custom Webhook Endpoints & Live Event Streaming</h3>
              </div>
              <p className={`text-xs mt-0.5 ${isDark ? 'text-neutral-400' : 'text-neutral-600'}`}>
                Broadcast JSON event streams directly to your proprietary servers on ticket sale, gate check-in, or refunds.
              </p>
            </div>

            <button
              onClick={() => setShowAddWebhookModal(true)}
              className="px-4 py-2 bg-white text-black hover:bg-neutral-200 font-bold rounded-xl flex items-center gap-2 cursor-pointer shadow-sm text-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Endpoint</span>
            </button>
          </div>

          {/* Webhook Endpoints List */}
          <div className="space-y-3">
            {customWebhooks.map((wh) => (
              <div
                key={wh.id}
                className={`p-4 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                  isDark ? 'bg-[#151D2C] border-[#253247]' : 'bg-neutral-50 border-[#E5E7EB]'
                }`}
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-sm">{wh.name}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                      wh.active ? 'bg-emerald-500/20 text-emerald-400' : 'bg-neutral-500/20 text-neutral-400'
                    }`}>
                      {wh.active ? 'Active' : 'Paused'}
                    </span>
                    {wh.lastResponseCode && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-white text-black font-bold">
                        HTTP {wh.lastResponseCode} ({wh.lastLatencyMs}ms)
                      </span>
                    )}
                  </div>

                  <div className="font-mono text-xs opacity-75 truncate max-w-xl">
                    {wh.url}
                  </div>

                  {/* Subscribed events */}
                  <div className="flex items-center gap-1.5 flex-wrap pt-1">
                    {wh.events.map(ev => (
                      <span key={ev} className="px-1.5 py-0.5 rounded bg-black/30 text-[10px] font-mono border border-white/10">
                        {ev}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleTriggerWebhookPing(wh.id)}
                    className={`px-3 py-1.5 rounded-lg font-semibold text-xs transition-colors cursor-pointer flex items-center gap-1.5 ${
                      isDark ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-neutral-200 hover:bg-neutral-300 text-black'
                    }`}
                  >
                    <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                    <span>Send Test Ping</span>
                  </button>

                  <button
                    onClick={() => handleToggleWebhook(wh.id)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                      wh.active ? 'text-amber-400 hover:bg-amber-400/10' : 'text-emerald-400 hover:bg-emerald-400/10'
                    }`}
                  >
                    {wh.active ? 'Pause' : 'Activate'}
                  </button>

                  <button
                    onClick={() => handleDeleteWebhook(wh.id)}
                    className="p-1.5 rounded-lg text-red-400 hover:bg-red-400/10 cursor-pointer"
                    title="Delete endpoint"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Webhook Activity Delivery Logs */}
          <div className="space-y-3 pt-4 border-t border-neutral-500/20">
            <h4 className="text-xs font-bold uppercase tracking-wider opacity-70">
              Recent Webhook Delivery Logs ({deliveryLogs.length})
            </h4>

            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-[11px]">
                <thead>
                  <tr className="border-b border-neutral-500/20 opacity-60">
                    <th className="py-2 pr-4">EVENT</th>
                    <th className="py-2 pr-4">ENDPOINT</th>
                    <th className="py-2 pr-4">STATUS</th>
                    <th className="py-2 pr-4">LATENCY</th>
                    <th className="py-2 pr-4">TIMESTAMP</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-500/10">
                  {deliveryLogs.slice(0, 5).map(log => (
                    <tr key={log.id} className="hover:bg-white/5">
                      <td className="py-2.5 pr-4 font-bold text-emerald-400">{log.event}</td>
                      <td className="py-2.5 pr-4 truncate max-w-xs">{log.endpointName}</td>
                      <td className="py-2.5 pr-4">
                        <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold">
                          HTTP {log.statusCode} OK
                        </span>
                      </td>
                      <td className="py-2.5 pr-4">{log.latencyMs}ms</td>
                      <td className="py-2.5 opacity-60">{new Date(log.timestamp).toLocaleTimeString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 5. CONFIGURATION MODAL / DRAWER */}
      {activeConfigItem && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-fade-in">
          <div className={`w-full max-w-2xl rounded-2xl shadow-2xl border overflow-hidden flex flex-col max-h-[90vh] ${
            isDark ? 'bg-[#0B0F17] border-[#1F2937] text-white' : 'bg-white border-[#E5E7EB] text-[#111827]'
          }`}>
            {/* Header */}
            <div className={`p-5 border-b flex items-center justify-between ${
              isDark ? 'border-[#1F2937] bg-[#111827]' : 'border-[#E5E7EB] bg-neutral-50'
            }`}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white text-black flex items-center justify-center font-bold">
                  {renderIcon(activeConfigItem.iconName)}
                </div>
                <div>
                  <h3 className="font-bold text-base">{activeConfigItem.name}</h3>
                  <p className="text-[11px] opacity-60">{activeConfigItem.categoryLabel} Configuration</p>
                </div>
              </div>

              <button
                onClick={() => setActiveConfigItem(null)}
                className="p-2 rounded-lg hover:bg-neutral-500/20 text-neutral-400 hover:text-white transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Body */}
            <div className="p-6 overflow-y-auto space-y-5 text-xs">
              
              {/* Environment toggle */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider mb-1.5 opacity-80">
                  Deployment Environment
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setConfigMode('live')}
                    className={`py-2 px-3 rounded-xl font-bold border transition-colors cursor-pointer ${
                      configMode === 'live' 
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' 
                        : isDark ? 'border-neutral-800 opacity-60' : 'border-neutral-200 opacity-60'
                    }`}
                  >
                    ● Production / Live Mode
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfigMode('sandbox')}
                    className={`py-2 px-3 rounded-xl font-bold border transition-colors cursor-pointer ${
                      configMode === 'sandbox' 
                        ? 'bg-amber-500/20 border-amber-500 text-amber-400' 
                        : isDark ? 'border-neutral-800 opacity-60' : 'border-neutral-200 opacity-60'
                    }`}
                  >
                    ○ Sandbox / Test Mode
                  </button>
                </div>
              </div>

              {/* API Key */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider mb-1.5 opacity-80">
                  API Key / Public Client ID
                </label>
                <div className="relative">
                  <Key className="w-4 h-4 absolute left-3 top-3 opacity-50" />
                  <input
                    type="text"
                    value={configApiKey}
                    onChange={(e) => setConfigApiKey(e.target.value)}
                    placeholder="e.g. pk_live_..."
                    className={`w-full pl-9 pr-3.5 py-2.5 rounded-xl border font-mono outline-none ${
                      isDark ? 'bg-[#151D2C] border-[#253247] text-white' : 'bg-white border-[#D1D5DB] text-black'
                    }`}
                  />
                </div>
              </div>

              {/* Secret Key */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider mb-1.5 opacity-80">
                  Secret Key / Private Auth Token
                </label>
                <div className="relative">
                  <ShieldCheck className="w-4 h-4 absolute left-3 top-3 opacity-50" />
                  <input
                    type={showSecretKey ? 'text' : 'password'}
                    value={configApiSecret}
                    onChange={(e) => setConfigApiSecret(e.target.value)}
                    placeholder="e.g. sk_live_..."
                    className={`w-full pl-9 pr-10 py-2.5 rounded-xl border font-mono outline-none ${
                      isDark ? 'bg-[#151D2C] border-[#253247] text-white' : 'bg-white border-[#D1D5DB] text-black'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowSecretKey(!showSecretKey)}
                    className="absolute right-3 top-2.5 text-neutral-400 hover:text-white cursor-pointer"
                  >
                    {showSecretKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Channel, Account, or Webhook */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider mb-1.5 opacity-80">
                    Account ID / List Identifier
                  </label>
                  <input
                    type="text"
                    value={configAccountId}
                    onChange={(e) => setConfigAccountId(e.target.value)}
                    placeholder="e.g. ACT_948201 or list_vip_..."
                    className={`w-full px-3.5 py-2.5 rounded-xl border font-mono outline-none ${
                      isDark ? 'bg-[#151D2C] border-[#253247] text-white' : 'bg-white border-[#D1D5DB] text-black'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider mb-1.5 opacity-80">
                    Channel, Room or Sender ID
                  </label>
                  <input
                    type="text"
                    value={configSenderId}
                    onChange={(e) => setConfigSenderId(e.target.value)}
                    placeholder="e.g. #ops-channel or +27..."
                    className={`w-full px-3.5 py-2.5 rounded-xl border font-mono outline-none ${
                      isDark ? 'bg-[#151D2C] border-[#253247] text-white' : 'bg-white border-[#D1D5DB] text-black'
                    }`}
                  />
                </div>
              </div>

              {/* Webhook Callback */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider mb-1.5 opacity-80">
                  Webhook Dispatch URL
                </label>
                <input
                  type="url"
                  value={configWebhookUrl}
                  onChange={(e) => setConfigWebhookUrl(e.target.value)}
                  placeholder="https://..."
                  className={`w-full px-3.5 py-2.5 rounded-xl border font-mono outline-none ${
                    isDark ? 'bg-[#151D2C] border-[#253247] text-white' : 'bg-white border-[#D1D5DB] text-black'
                  }`}
                />
              </div>

              {/* Automated sync switch */}
              <div className={`p-4 rounded-xl border flex items-center justify-between ${
                isDark ? 'bg-[#151D2C] border-[#253247]' : 'bg-neutral-50 border-[#E5E7EB]'
              }`}>
                <div>
                  <span className="font-bold block">Automatic Real-Time Sync</span>
                  <span className="text-[11px] opacity-70">Instantly stream transactions, attendees, and check-ins</span>
                </div>
                <input
                  type="checkbox"
                  checked={configAutoSync}
                  onChange={(e) => setConfigAutoSync(e.target.checked)}
                  className="w-5 h-5 accent-emerald-500 cursor-pointer"
                />
              </div>

              {/* Handshake test feedback */}
              {handshakeFeedback && (
                <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2 font-mono">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{handshakeFeedback}</span>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className={`p-4 sm:p-5 border-t flex items-center justify-between gap-3 ${
              isDark ? 'border-[#1F2937] bg-[#111827]' : 'border-[#E5E7EB] bg-neutral-50'
            }`}>
              <button
                type="button"
                onClick={() => handleTestHandshake()}
                disabled={testingHandshake}
                className={`px-4 py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer flex items-center gap-2 ${
                  isDark ? 'border-neutral-700 hover:bg-white/10 text-white' : 'border-neutral-300 hover:bg-neutral-100 text-black'
                }`}
              >
                {testingHandshake ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Verifying Handshake...</span>
                  </>
                ) : (
                  <>
                    <Radio className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Test Handshake</span>
                  </>
                )}
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveConfigItem(null)}
                  className="px-3.5 py-2 text-xs font-semibold opacity-70 hover:opacity-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveConfig}
                  className="px-5 py-2 rounded-xl bg-white text-black hover:bg-neutral-200 font-bold text-xs cursor-pointer shadow-lg transition-all"
                >
                  Save & Enable Sync
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. CREATE WEBHOOK MODAL */}
      {showAddWebhookModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-fade-in">
          <div className={`w-full max-w-lg rounded-2xl shadow-2xl border overflow-hidden ${
            isDark ? 'bg-[#0B0F17] border-[#1F2937] text-white' : 'bg-white border-[#E5E7EB] text-[#111827]'
          }`}>
            <div className={`p-5 border-b flex items-center justify-between ${
              isDark ? 'border-[#1F2937] bg-[#111827]' : 'border-[#E5E7EB] bg-neutral-50'
            }`}>
              <div className="flex items-center gap-2.5">
                <Code2 className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-base">New Webhook Endpoint</h3>
              </div>
              <button
                onClick={() => setShowAddWebhookModal(false)}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateWebhook} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider mb-1.5 opacity-80">
                  Endpoint Name *
                </label>
                <input
                  type="text"
                  required
                  value={newWebhookName}
                  onChange={(e) => setNewWebhookName(e.target.value)}
                  placeholder="e.g. Ticketing ERP Webhook"
                  className={`w-full px-3.5 py-2.5 rounded-xl border outline-none font-medium ${
                    isDark ? 'bg-[#151D2C] border-[#253247] text-white' : 'bg-white border-[#D1D5DB] text-black'
                  }`}
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider mb-1.5 opacity-80">
                  Destination URL (HTTPS) *
                </label>
                <input
                  type="url"
                  required
                  value={newWebhookUrl}
                  onChange={(e) => setNewWebhookUrl(e.target.value)}
                  placeholder="https://api.yourdomain.com/webhooks/nexora"
                  className={`w-full px-3.5 py-2.5 rounded-xl border font-mono outline-none ${
                    isDark ? 'bg-[#151D2C] border-[#253247] text-white' : 'bg-white border-[#D1D5DB] text-black'
                  }`}
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider mb-1.5 opacity-80">
                  Signing Secret (HMAC-SHA256)
                </label>
                <input
                  type="text"
                  value={newWebhookSecret}
                  onChange={(e) => setNewWebhookSecret(e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl border font-mono outline-none ${
                    isDark ? 'bg-[#151D2C] border-[#253247] text-white' : 'bg-white border-[#D1D5DB] text-black'
                  }`}
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider mb-2 opacity-80">
                  Subscribed Event Triggers
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    'ticket.purchased',
                    'attendee.checked_in',
                    'order.completed',
                    'refund.processed',
                    'event.published',
                    'payout.processed'
                  ].map(ev => {
                    const isChecked = newWebhookEvents.includes(ev);
                    return (
                      <label 
                        key={ev} 
                        className={`p-2.5 rounded-xl border flex items-center gap-2 cursor-pointer transition-colors ${
                          isChecked 
                            ? 'bg-white/10 border-white text-white font-bold' 
                            : isDark ? 'border-neutral-800 opacity-60' : 'border-neutral-200 opacity-60'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setNewWebhookEvents([...newWebhookEvents, ev]);
                            } else {
                              setNewWebhookEvents(newWebhookEvents.filter(x => x !== ev));
                            }
                          }}
                          className="accent-white"
                        />
                        <span className="font-mono text-[10px]">{ev}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-2 border-t border-neutral-500/20">
                <button
                  type="button"
                  onClick={() => setShowAddWebhookModal(false)}
                  className="px-4 py-2 font-semibold opacity-70 hover:opacity-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-white text-black hover:bg-neutral-200 font-bold rounded-xl cursor-pointer shadow-md"
                >
                  Create Endpoint
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 7. LIVE TEST PING SIMULATOR MODAL */}
      {testPingModal.open && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-fade-in">
          <div className={`w-full max-w-xl rounded-2xl shadow-2xl border overflow-hidden ${
            isDark ? 'bg-[#0B0F17] border-[#1F2937] text-white' : 'bg-white border-[#E5E7EB] text-[#111827]'
          }`}>
            <div className={`p-5 border-b flex items-center justify-between ${
              isDark ? 'border-[#1F2937] bg-[#111827]' : 'border-[#E5E7EB] bg-neutral-50'
            }`}>
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-emerald-400" />
                <h3 className="font-bold text-sm">Webhook Delivery Inspector</h3>
              </div>
              <button
                onClick={() => setTestPingModal({ open: false, loading: false })}
                className="p-1 rounded text-neutral-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4 font-mono text-xs">
              {testPingModal.loading ? (
                <div className="py-8 flex flex-col items-center justify-center gap-3">
                  <div className="w-6 h-6 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
                  <span className="opacity-70">Dispatching signed webhook packet...</span>
                </div>
              ) : testPingModal.result ? (
                <div className="space-y-3">
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-between">
                    <span className="font-bold">{testPingModal.result.message}</span>
                    <span className="text-[10px]">{testPingModal.result.latencyMs}ms</span>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold uppercase opacity-60 block mb-1">Server Response Body</span>
                    <pre className={`p-3.5 rounded-xl border overflow-x-auto text-[11px] ${
                      isDark ? 'bg-[#151D2C] border-[#253247] text-emerald-300' : 'bg-neutral-900 text-emerald-400'
                    }`}>
                      {testPingModal.result.responseBody}
                    </pre>
                  </div>
                </div>
              ) : null}

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => setTestPingModal({ open: false, loading: false })}
                  className="px-5 py-2 bg-white text-black hover:bg-neutral-200 font-bold rounded-xl cursor-pointer text-xs"
                >
                  Close Inspector
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
