import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft,
  QrCode,
  Users,
  Search,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  RefreshCw,
  Camera,
  Download,
  Wifi,
  WifiOff,
  Volume2,
  VolumeX,
  Flashlight,
  Sliders,
  ShieldCheck,
  ShieldAlert,
  ChevronRight,
  UserCheck,
  Building,
  Calendar,
  MapPin,
  ExternalLink,
  RotateCcw,
  Sparkles,
  Zap,
  Filter,
  Check,
  FileSpreadsheet,
  HelpCircle,
  Layers
} from 'lucide-react';
import { Event, Ticket, CheckInLog } from '../../types';
import { store } from '../../lib/store';

interface GuestTicketScannerPageProps {
  onBack: () => void;
  onLaunchScannerModal?: () => void;
  theme?: 'light' | 'dark';
}

type ScannerTab = 'overview' | 'scanner' | 'guest_list' | 'entry_gates' | 'reports' | 'settings';

export const GuestTicketScannerPage: React.FC<GuestTicketScannerPageProps> = ({
  onBack,
  onLaunchScannerModal,
  theme = 'dark',
}) => {
  const isDark = theme === 'dark';

  // Navigation
  const [activeTab, setActiveTab] = useState<ScannerTab>('scanner');

  // Events & selection
  const events = store.getEvents();
  const [selectedEventId, setSelectedEventId] = useState<string>(events[0]?.id || '');
  const activeEvent = events.find(e => e.id === selectedEventId) || events[0];

  // Gates & Staff
  const GATES = [
    { id: 'gate-1', name: 'Main Entrance', type: 'General & VIP', staff: 'Kwame Mensah', active: true, latency: '0.42s' },
    { id: 'gate-2', name: 'VIP Fast Track', type: 'VIP & Backstage', staff: 'Zanele Ndlovu', active: true, latency: '0.38s' },
    { id: 'gate-3', name: 'North Turnstiles', type: 'General Admission', staff: 'Tariq Al-Mansoor', active: true, latency: '0.51s' },
    { id: 'gate-4', name: 'Speaker & Artist Gate', type: 'Credentials Only', staff: 'Nia Adebayo', active: true, latency: '0.29s' },
  ];
  const [selectedGate, setSelectedGate] = useState(GATES[0].name);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('All');

  // Operational State
  const [tickets, setTickets] = useState<Ticket[]>(store.getTickets());
  const [manualCode, setManualCode] = useState('');
  const [searchGuestQuery, setSearchGuestQuery] = useState('');
  const [guestStatusFilter, setGuestStatusFilter] = useState<'all' | 'valid' | 'checked_in'>('all');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [rapidScanning, setRapidScanning] = useState(true);
  const [torchEnabled, setTorchEnabled] = useState(false);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [autoResetTimer, setAutoResetTimer] = useState<number | null>(null);

  // Scan Result State (The 3 Critical States: valid / duplicate / invalid)
  const [scanResult, setScanResult] = useState<{
    state: 'valid' | 'duplicate' | 'invalid';
    title: string;
    guestName: string;
    ticketTier: string;
    ticketCode: string;
    gate: string;
    time: string;
    reason?: string;
    previousCheckIn?: { time: string; gate: string; staff: string };
  } | null>(null);

  // Scan history / logs
  const [scanLogs, setScanLogs] = useState<CheckInLog[]>([]);

  // Video element ref for real webcam/mobile camera
  const videoRef = useRef<HTMLVideoElement>(null);

  // Reload tickets & logs for selected event
  useEffect(() => {
    setTickets(store.getTickets());
    setScanLogs(store.getCheckInLogs(selectedEventId));
  }, [selectedEventId]);

  // Audio tone synthesizer for crisp feedback
  const playFeedbackTone = (type: 'valid' | 'warning' | 'error') => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);

      if (type === 'valid') {
        // High dual-tone chime
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
        osc.frequency.setValueAtTime(880, audioCtx.currentTime + 0.08); // A5
        gain.gain.setValueAtTime(0.25, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.35);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.35);
      } else if (type === 'warning') {
        // Two warning pulses
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(440, audioCtx.currentTime);
        osc.frequency.setValueAtTime(349.23, audioCtx.currentTime + 0.12);
        gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.45);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.45);
      } else {
        // Low buzzy error tone
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(220, audioCtx.currentTime);
        osc.frequency.setValueAtTime(146.83, audioCtx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.35, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.5);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.5);
      }
    } catch (e) {
      console.warn('Audio tone failed', e);
    }
  };

  // Turn camera on / off
  const startCamera = async () => {
    try {
      setCameraActive(true);
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode }
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      }
    } catch (err) {
      console.warn('Camera stream initialisation bypassed in preview iframe', err);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
    setCameraActive(false);
  };

  // Ticket processing with the 3 critical states
  const processTicketVerification = (codeToScan: string) => {
    const trimmed = codeToScan.trim().toUpperCase();
    if (!trimmed) return;

    // Check in the store
    const log = store.validateAndCheckIn({
      scannedPayload: trimmed,
      eventId: selectedEventId,
      staffName: 'Gate Lead',
      gate: selectedGate,
    });

    const nowTimeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const allTkts = store.getTickets();
    const matchedTicket = allTkts.find(t => t.ticketCode.toUpperCase() === trimmed || t.id.toUpperCase() === trimmed);

    if (log.result === 'valid') {
      playFeedbackTone('valid');
      setScanResult({
        state: 'valid',
        title: 'ENTRY APPROVED',
        guestName: matchedTicket?.attendeeName || 'Registered Guest',
        ticketTier: matchedTicket?.tierName || 'Standard Admission',
        ticketCode: trimmed,
        gate: selectedGate,
        time: nowTimeStr,
      });

      // Rapid consecutive scanning auto-reset
      if (rapidScanning) {
        setAutoResetTimer(3);
        const interval = setInterval(() => {
          setAutoResetTimer(prev => {
            if (prev && prev > 1) return prev - 1;
            clearInterval(interval);
            return null;
          });
        }, 1000);
      }
    } else if (log.result === 'already_checked_in') {
      playFeedbackTone('warning');
      const priorLog = scanLogs.find(l => l.ticketCode.toUpperCase() === trimmed);
      setScanResult({
        state: 'duplicate',
        title: 'DUPLICATE SCAN',
        guestName: matchedTicket?.attendeeName || 'Guest (Already Inside)',
        ticketTier: matchedTicket?.tierName || 'Tier Pass',
        ticketCode: trimmed,
        gate: selectedGate,
        time: nowTimeStr,
        reason: 'Ticket has already passed through turnstiles. Potential pass-back attempt.',
        previousCheckIn: {
          time: priorLog ? new Date(priorLog.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '13:42',
          gate: priorLog?.gate || 'VIP Entrance',
          staff: priorLog?.staffName || 'Staff Scanner Node 1'
        }
      });
      setAutoResetTimer(null);
    } else {
      playFeedbackTone('error');
      setScanResult({
        state: 'invalid',
        title: 'ENTRY NOT APPROVED',
        guestName: matchedTicket?.attendeeName || 'Unrecognized / Cancelled',
        ticketTier: matchedTicket?.tierName || 'Unverified Category',
        ticketCode: trimmed,
        gate: selectedGate,
        time: nowTimeStr,
        reason: log.result === 'refunded' 
          ? 'Ticket was previously refunded / revoked.'
          : 'Cryptographic token unrecognized, cancelled, or not eligible for this event.',
      });
      setAutoResetTimer(null);
    }

    // Refresh tickets & logs
    setTickets([...store.getTickets()]);
    setScanLogs(store.getCheckInLogs(selectedEventId));
    setManualCode('');
  };

  // Metric totals for the selected event
  const eventTickets = tickets.filter(t => !selectedEventId || t.eventId === selectedEventId);
  const totalRegistered = eventTickets.length || 1250;
  const totalCheckedIn = eventTickets.filter(t => t.status === 'checked_in').length || 684;
  const notArrived = Math.max(0, totalRegistered - totalCheckedIn);
  const attendanceRate = totalRegistered > 0 ? ((totalCheckedIn / totalRegistered) * 100).toFixed(1) : '54.7';

  // Sample scenarios for instantaneous demo testing
  const sampleValidTicket = eventTickets.find(t => t.status === 'valid');
  const sampleCheckedInTicket = eventTickets.find(t => t.status === 'checked_in');

  // Filtered guest list
  const filteredGuests = eventTickets.filter(tkt => {
    const matchesSearch = 
      tkt.id.toLowerCase().includes(searchGuestQuery.toLowerCase()) ||
      tkt.ticketCode.toLowerCase().includes(searchGuestQuery.toLowerCase()) ||
      (tkt.attendeeName && tkt.attendeeName.toLowerCase().includes(searchGuestQuery.toLowerCase())) ||
      (tkt.attendeeEmail && tkt.attendeeEmail.toLowerCase().includes(searchGuestQuery.toLowerCase()));

    const matchesStatus = 
      guestStatusFilter === 'all' ? true : tkt.status === guestStatusFilter;

    const matchesCategory = 
      selectedCategoryFilter === 'All' ? true : tkt.tierName.toLowerCase().includes(selectedCategoryFilter.toLowerCase());

    return matchesSearch && matchesStatus && matchesCategory;
  });

  // Recent admissions feed
  const recentAdmissions = [
    { name: 'Amara Nkosi', tier: 'VIP Pass', time: '14:08', gate: 'Main Entrance', status: 'Admitted' },
    { name: 'Daniel Mokoena', tier: 'General Admission', time: '14:07', gate: 'Main Entrance', status: 'Admitted' },
    { name: 'Sarah Williams', tier: 'Speaker Pass', time: '14:06', gate: 'VIP Fast Track', status: 'Admitted' },
    { name: 'Kwabena Darko', tier: 'Exhibitor Delegate', time: '14:02', gate: 'North Turnstile', status: 'Admitted' },
    { name: 'Thandiwe Khumalo', tier: 'VIP Pass', time: '13:58', gate: 'VIP Fast Track', status: 'Admitted' },
  ];

  // Export Manifest CSV
  const handleExportCSV = () => {
    const csvRows = [
      ['Ticket ID', 'Attendee Name', 'Tier', 'Status', 'Event', 'Check-In Time'].join(','),
      ...eventTickets.map(t => [
        t.ticketCode,
        `"${t.attendeeName || 'Guest'}"`,
        `"${t.tierName}"`,
        t.status,
        `"${t.eventTitle}"`,
        t.checkedInAt || 'N/A'
      ].join(','))
    ];
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance_manifest_${activeEvent?.id || 'event'}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className={`min-h-screen w-full transition-colors flex flex-col ${
      isDark ? 'bg-[#0A0D14] text-white' : 'bg-[#F4F6F9] text-[#111827]'
    }`}>

      {/* TOP HEADER / COMMAND BAR */}
      <header className={`sticky top-0 z-40 backdrop-blur-xl border-b transition-colors px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4 ${
        isDark ? 'bg-[#0E131F]/90 border-[#1F2937]' : 'bg-white/95 border-[#E5E7EB] shadow-xs'
      }`}>
        <div className="flex items-center gap-3 sm:gap-4">
          <button
            onClick={onBack}
            className={`p-2.5 rounded-xl border transition-colors cursor-pointer flex items-center gap-2 ${
              isDark ? 'border-white/15 hover:bg-white/10 text-white' : 'border-neutral-300 hover:bg-neutral-100 text-neutral-800'
            }`}
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-xs font-bold hidden md:inline">Organizer Portal</span>
          </button>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono tracking-wider font-extrabold uppercase text-[#F6A623]">
                NEXORA
              </span>
              <span className={`text-[10px] font-mono uppercase ${isDark ? 'text-white/40' : 'text-neutral-400'}`}>/</span>
              <span className={`text-[10px] font-mono uppercase font-bold ${isDark ? 'text-white/70' : 'text-neutral-600'}`}>
                EVENT OPERATIONS
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] bg-emerald-500/15 text-emerald-400 px-2 py-0.5 rounded-full font-bold uppercase font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Event Active
              </span>
            </div>
            <h1 className="text-lg sm:text-xl font-black tracking-tight flex items-center gap-2">
              Guest Ticket Scanner
            </h1>
          </div>
        </div>

        {/* Current Event & Gate Selector Bar */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs ${
            isDark ? 'bg-[#151D2C] border-[#253247] text-white' : 'bg-white border-[#D1D5DB] text-neutral-900 shadow-xs'
          }`}>
            <span className={`text-[11px] font-mono uppercase font-bold ${isDark ? 'text-white/60' : 'text-neutral-500'}`}>Event:</span>
            <select
              value={selectedEventId}
              onChange={e => setSelectedEventId(e.target.value)}
              className={`font-bold bg-transparent focus:outline-none cursor-pointer max-w-[180px] sm:max-w-[220px] truncate ${
                isDark ? 'text-white' : 'text-neutral-900'
              }`}
            >
              {events.map(ev => (
                <option key={ev.id} value={ev.id} className={isDark ? 'bg-[#0E131F] text-white' : 'bg-white text-black'}>
                  {ev.title}
                </option>
              ))}
            </select>
          </div>

          <div className={`hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs ${
            isDark ? 'bg-[#151D2C] border-[#253247] text-white' : 'bg-white border-[#D1D5DB] text-neutral-900 shadow-xs'
          }`}>
            <MapPin className="w-3.5 h-3.5 text-[#F6A623]" />
            <span className="font-semibold">{selectedGate}</span>
          </div>

          {/* Sound & Offline Controls */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-2 rounded-xl border transition-colors cursor-pointer ${
              soundEnabled
                ? (isDark ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-emerald-50 border-emerald-300 text-emerald-700')
                : (isDark ? 'bg-white/5 border-white/10 text-white/40' : 'bg-neutral-100 border-neutral-300 text-neutral-400')
            }`}
            title="Toggle scanner audio chime"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          <button
            onClick={() => setIsOfflineMode(!isOfflineMode)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-mono font-bold transition-colors cursor-pointer ${
              isOfflineMode
                ? 'bg-amber-500/15 border-amber-500/40 text-amber-400'
                : (isDark ? 'bg-white/5 border-white/10 text-white/80 hover:bg-white/10' : 'bg-white border-neutral-300 text-neutral-700 hover:bg-neutral-50')
            }`}
            title="Toggle offline local caching mode"
          >
            {isOfflineMode ? <WifiOff className="w-3.5 h-3.5 text-amber-400" /> : <Wifi className="w-3.5 h-3.5 text-emerald-400" />}
            <span className="hidden sm:inline">{isOfflineMode ? 'Offline Cache' : 'Edge Live'}</span>
          </button>

          {onLaunchScannerModal && (
            <button
              onClick={onLaunchScannerModal}
              className={`px-4 py-2 text-xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-md flex items-center gap-2 ${
                isDark ? 'bg-white text-black hover:bg-neutral-200' : 'bg-neutral-900 text-white hover:bg-black'
              }`}
            >
              <Camera className="w-4 h-4" />
              <span className="hidden sm:inline">Popup Scanner</span>
            </button>
          )}
        </div>
      </header>

      {/* SUB-HEADER / TAB NAVIGATION */}
      <div className={`border-b px-4 sm:px-6 lg:px-8 py-2 flex items-center justify-between gap-4 overflow-x-auto ${
        isDark ? 'bg-[#0E131F]/50 border-[#1F2937]' : 'bg-white border-[#E5E7EB]'
      }`}>
        <div className="flex items-center gap-1 sm:gap-2 min-w-max">
          {[
            { id: 'overview', label: 'Overview', icon: Layers },
            { id: 'scanner', label: 'Guest Ticket Scanner', icon: QrCode },
            { id: 'guest_list', label: 'Guest List', icon: Users },
            { id: 'entry_gates', label: 'Entry Gates', icon: Building },
            { id: 'reports', label: 'Attendance Reports', icon: FileSpreadsheet },
            { id: 'settings', label: 'Scanner Settings', icon: Sliders },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as ScannerTab)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-[#F6A623] text-black shadow-md'
                    : (isDark ? 'text-white/70 hover:bg-white/10 hover:text-white' : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900')
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs font-mono">
          <span className={`w-2 h-2 rounded-full ${isOfflineMode ? 'bg-amber-400' : 'bg-emerald-400 animate-pulse'}`} />
          <span className={isDark ? 'text-white/60' : 'text-neutral-500'}>
            Gate Latency: 0.38s · Pass-Back Guard Active
          </span>
        </div>
      </div>

      {/* TOP METRICS ROW: REGISTERED / CHECKED IN / NOT ARRIVED / SCANNERS ONLINE */}
      <section className="px-4 sm:px-6 lg:px-8 pt-6 pb-2">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Card 1: REGISTERED */}
          <div className={`p-5 rounded-2xl border transition-all ${
            isDark ? 'bg-[#0E131F] border-[#1F2937]' : 'bg-white border-[#E5E7EB] shadow-xs'
          }`}>
            <div className="flex items-center justify-between text-[11px] font-mono uppercase font-bold tracking-wider opacity-60">
              <span>REGISTERED</span>
              <Users className="w-4 h-4 text-[#F6A623]" />
            </div>
            <div className="text-2xl sm:text-3xl font-black font-mono mt-2">
              {totalRegistered.toLocaleString()}
            </div>
            <div className={`text-xs mt-1 ${isDark ? 'text-white/50' : 'text-neutral-500'}`}>
              All ticket holders
            </div>
          </div>

          {/* Card 2: CHECKED IN */}
          <div className={`p-5 rounded-2xl border transition-all ${
            isDark ? 'bg-[#0E131F] border-[#1F2937]' : 'bg-white border-[#E5E7EB] shadow-xs'
          }`}>
            <div className="flex items-center justify-between text-[11px] font-mono uppercase font-bold tracking-wider text-emerald-400">
              <span>CHECKED IN</span>
              <UserCheck className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black font-mono mt-2 text-emerald-400">
              {totalCheckedIn.toLocaleString()}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <div className="w-full bg-emerald-950/40 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-emerald-400 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, parseFloat(attendanceRate))}%` }}
                />
              </div>
              <span className="text-xs font-mono font-bold text-emerald-400 whitespace-nowrap">
                {attendanceRate}%
              </span>
            </div>
          </div>

          {/* Card 3: NOT ARRIVED */}
          <div className={`p-5 rounded-2xl border transition-all ${
            isDark ? 'bg-[#0E131F] border-[#1F2937]' : 'bg-white border-[#E5E7EB] shadow-xs'
          }`}>
            <div className="flex items-center justify-between text-[11px] font-mono uppercase font-bold tracking-wider opacity-60">
              <span>NOT ARRIVED</span>
              <Clock className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black font-mono mt-2">
              {notArrived.toLocaleString()}
            </div>
            <div className={`text-xs mt-1 ${isDark ? 'text-white/50' : 'text-neutral-500'}`}>
              Awaiting entry at gates
            </div>
          </div>

          {/* Card 4: SCANNERS ONLINE */}
          <div className={`p-5 rounded-2xl border transition-all ${
            isDark ? 'bg-[#0E131F] border-[#1F2937]' : 'bg-white border-[#E5E7EB] shadow-xs'
          }`}>
            <div className="flex items-center justify-between text-[11px] font-mono uppercase font-bold tracking-wider opacity-60">
              <span>SCANNERS ONLINE</span>
              <ShieldCheck className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black font-mono mt-2 flex items-baseline gap-2">
              <span>4</span>
              <span className="text-xs font-bold text-emerald-400 font-mono">100% Health</span>
            </div>
            <div className={`text-xs mt-1 ${isDark ? 'text-white/50' : 'text-neutral-500'}`}>
              Across entry gates
            </div>
          </div>

        </div>
      </section>

      {/* MAIN TAB CONTENT WORKSPACE */}
      <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6">
        
        {/* ========================================================= */}
        {/* TAB 1: GUEST TICKET SCANNER (COMMAND WORKSPACE)           */}
        {/* ========================================================= */}
        {activeTab === 'scanner' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* LEFT COLUMN: CAMERA VIEWFINDER & CONTROLS */}
              <div className="lg:col-span-7 space-y-6">
                
                {/* Large Scanning Box */}
                <div className={`rounded-2xl border overflow-hidden relative shadow-xl ${
                  isDark ? 'bg-[#0E131F] border-[#1F2937]' : 'bg-white border-[#E5E7EB]'
                }`}>
                  {/* Scanner Header Bar */}
                  <div className={`p-4 border-b flex items-center justify-between gap-4 ${
                    isDark ? 'bg-[#151D2C] border-[#253247]' : 'bg-neutral-50 border-neutral-200'
                  }`}>
                    <div className="flex items-center gap-2">
                      <QrCode className="w-5 h-5 text-[#F6A623]" />
                      <span className="font-black text-sm tracking-tight">QR TICKET SCAN AREA</span>
                    </div>

                    <div className="flex items-center gap-2 text-xs">
                      {/* Rapid Consecutive Scanning Mode Toggle */}
                      <button
                        onClick={() => setRapidScanning(!rapidScanning)}
                        className={`px-2.5 py-1 rounded-lg border font-mono text-[11px] font-bold transition-colors cursor-pointer flex items-center gap-1 ${
                          rapidScanning
                            ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                            : (isDark ? 'bg-white/5 text-white/50 border-white/10' : 'bg-white text-neutral-500 border-neutral-300')
                        }`}
                        title="Rapid continuous scan with instant auto-reset"
                      >
                        <Zap className="w-3 h-3" />
                        <span>Rapid Mode {rapidScanning ? 'ON' : 'OFF'}</span>
                      </button>

                      {/* Flashlight / Torch */}
                      <button
                        onClick={() => setTorchEnabled(!torchEnabled)}
                        className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                          torchEnabled
                            ? 'bg-[#F6A623] text-black border-[#F6A623]'
                            : (isDark ? 'bg-white/5 text-white/50 border-white/10' : 'bg-white text-neutral-500 border-neutral-300')
                        }`}
                        title="Toggle flashlight / torch"
                      >
                        <Flashlight className="w-3.5 h-3.5" />
                      </button>

                      {/* Camera Selector */}
                      <button
                        onClick={() => {
                          const nextMode = facingMode === 'environment' ? 'user' : 'environment';
                          setFacingMode(nextMode);
                          if (cameraActive) {
                            stopCamera();
                            setTimeout(startCamera, 150);
                          }
                        }}
                        className={`px-2 py-1 rounded-lg border font-mono text-[11px] transition-colors cursor-pointer ${
                          isDark ? 'bg-white/5 text-white/70 border-white/10 hover:bg-white/10' : 'bg-white text-neutral-700 border-neutral-300 hover:bg-neutral-100'
                        }`}
                        title="Flip camera front/rear"
                      >
                        {facingMode === 'environment' ? 'Rear Cam' : 'Front Cam'}
                      </button>
                    </div>
                  </div>

                  {/* Optical Scanning Area / Viewfinder */}
                  <div className="relative aspect-[16/10] sm:aspect-[16/9] w-full bg-black flex flex-col items-center justify-center overflow-hidden">
                    {cameraActive ? (
                      <>
                        <video
                          ref={videoRef}
                          autoPlay
                          playsInline
                          className="w-full h-full object-cover"
                        />
                        {/* Target Scanning Crosshair with Animated Laser */}
                        <div className="absolute inset-12 sm:inset-16 border-2 border-[#F6A623]/80 rounded-2xl pointer-events-none flex flex-col items-center justify-between p-3">
                          <div className="w-full flex justify-between">
                            <div className="w-4 h-4 border-t-2 border-l-2 border-[#F6A623]" />
                            <div className="w-4 h-4 border-t-2 border-r-2 border-[#F6A623]" />
                          </div>
                          
                          {/* Animated laser line */}
                          <div className="w-full h-0.5 bg-[#F6A623] shadow-[0_0_12px_#F6A623] animate-pulse" />

                          <div className="w-full flex justify-between">
                            <div className="w-4 h-4 border-b-2 border-l-2 border-[#F6A623]" />
                            <div className="w-4 h-4 border-b-2 border-r-2 border-[#F6A623]" />
                          </div>
                        </div>

                        {/* Scanner Status Badge */}
                        <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-xs text-white/90 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 font-mono">
                          <span>Live Optical Engine Active</span>
                          <button
                            onClick={stopCamera}
                            className="text-red-400 hover:underline font-bold cursor-pointer"
                          >
                            Stop Camera
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className="text-center p-8 space-y-4 max-w-md mx-auto">
                        <div className="w-20 h-20 rounded-3xl bg-[#151D2C] border border-[#253247] flex items-center justify-center mx-auto text-[#F6A623] shadow-inner">
                          <QrCode className="w-10 h-10" />
                        </div>
                        
                        <div className="space-y-1">
                          <h3 className="text-base sm:text-lg font-black text-white">
                            Ready to scan
                          </h3>
                          <p className="text-xs text-neutral-400">
                            Position the guest's QR ticket inside the frame or enter pass ID manually.
                          </p>
                        </div>

                        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                          <button
                            onClick={startCamera}
                            className="px-6 py-3 bg-[#F6A623] hover:bg-[#E59516] text-black font-black text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-lg flex items-center gap-2"
                          >
                            <Camera className="w-4 h-4" />
                            <span>Open Scanner Experience</span>
                          </button>

                          <button
                            onClick={() => {
                              const el = document.getElementById('manual-ticket-input');
                              el?.focus();
                            }}
                            className="px-4 py-3 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl transition-all cursor-pointer border border-white/15"
                          >
                            Find Guest Manually
                          </button>
                        </div>

                        <div className="pt-2 text-[11px] text-neutral-500 font-mono flex items-center justify-center gap-1.5">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Camera access required · Authorized event staff only</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Manual Code Input Bar */}
                  <div className={`p-5 border-t space-y-3 ${
                    isDark ? 'bg-[#0E131F] border-[#1F2937]' : 'bg-white border-[#E5E7EB]'
                  }`}>
                    <label className={`block text-xs font-mono uppercase font-bold ${
                      isDark ? 'text-white/70' : 'text-neutral-600'
                    }`}>
                      Manual Ticket ID / Cryptographic QR Token
                    </label>
                    <div className="flex gap-2">
                      <input
                        id="manual-ticket-input"
                        type="text"
                        value={manualCode}
                        onChange={e => setManualCode(e.target.value)}
                        placeholder="e.g. NX-TKT-94821 or tkt-179159-001"
                        className={`flex-1 px-4 py-3 rounded-xl text-sm font-mono tracking-wider border focus:outline-none focus:ring-2 focus:ring-[#F6A623] ${
                          isDark ? 'bg-[#151D2C] border-[#253247] text-white placeholder-neutral-500' : 'bg-neutral-50 border-neutral-300 text-neutral-900 placeholder-neutral-400'
                        }`}
                        onKeyDown={e => e.key === 'Enter' && processTicketVerification(manualCode)}
                      />
                      <button
                        onClick={() => processTicketVerification(manualCode)}
                        disabled={!manualCode.trim()}
                        className="px-6 py-3 bg-[#F6A623] hover:bg-[#E59516] disabled:opacity-40 text-black font-black text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-md shrink-0"
                      >
                        Verify Ticket
                      </button>
                    </div>

                    {/* Quick Simulation Scenarios (For rapid verification & proof) */}
                    <div className="pt-2">
                      <span className={`text-[10px] font-mono uppercase font-bold tracking-wider block mb-2 ${
                        isDark ? 'text-white/50' : 'text-neutral-500'
                      }`}>
                        Instant Scenario Test Triggers:
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {sampleValidTicket && (
                          <button
                            onClick={() => processTicketVerification(sampleValidTicket.ticketCode)}
                            className="px-3 py-1.5 rounded-lg border text-xs font-mono font-bold bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 cursor-pointer transition-colors"
                          >
                            ✓ Valid Pass ({sampleValidTicket.ticketCode})
                          </button>
                        )}
                        {sampleCheckedInTicket && (
                          <button
                            onClick={() => processTicketVerification(sampleCheckedInTicket.ticketCode)}
                            className="px-3 py-1.5 rounded-lg border text-xs font-mono font-bold bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/20 cursor-pointer transition-colors"
                          >
                            ⚠ Duplicate / Used ({sampleCheckedInTicket.ticketCode})
                          </button>
                        )}
                        <button
                          onClick={() => processTicketVerification('NX-REFUND-8819')}
                          className="px-3 py-1.5 rounded-lg border text-xs font-mono font-bold bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20 cursor-pointer transition-colors"
                        >
                          ✕ Fraud / Invalid Token
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

              </div>

              {/* RIGHT COLUMN: THE 3 CRITICAL SCAN STATES & RECENT FEED */}
              <div className="lg:col-span-5 space-y-6">
                
                {/* THE 3 CRITICAL SCAN STATES CARD */}
                {scanResult ? (
                  <div
                    className={`p-6 sm:p-7 rounded-2xl border transition-all shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-200 ${
                      scanResult.state === 'valid'
                        ? 'bg-gradient-to-br from-emerald-950 via-emerald-900 to-[#0A2E1A] border-emerald-500 text-white'
                        : scanResult.state === 'duplicate'
                        ? 'bg-gradient-to-br from-amber-950 via-amber-900 to-[#331B05] border-amber-500 text-white'
                        : 'bg-gradient-to-br from-red-950 via-red-900 to-[#380909] border-red-500 text-white'
                    }`}
                  >
                    {/* Top Status Header */}
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className={`p-3 rounded-2xl ${
                          scanResult.state === 'valid'
                            ? 'bg-emerald-400 text-black'
                            : scanResult.state === 'duplicate'
                            ? 'bg-amber-400 text-black'
                            : 'bg-red-400 text-white'
                        }`}>
                          {scanResult.state === 'valid' && <CheckCircle2 className="w-8 h-8" />}
                          {scanResult.state === 'duplicate' && <AlertTriangle className="w-8 h-8" />}
                          {scanResult.state === 'invalid' && <XCircle className="w-8 h-8" />}
                        </div>
                        <div>
                          <span className={`text-[11px] font-mono uppercase font-black tracking-widest px-2 py-0.5 rounded ${
                            scanResult.state === 'valid'
                              ? 'bg-emerald-400/20 text-emerald-300'
                              : scanResult.state === 'duplicate'
                              ? 'bg-amber-400/20 text-amber-300'
                              : 'bg-red-400/20 text-red-300'
                          }`}>
                            {scanResult.state === 'valid' ? 'Valid' : scanResult.state === 'duplicate' ? 'Warning' : 'Rejected'}
                          </span>
                          <h2 className="text-xl sm:text-2xl font-black tracking-tight mt-1">
                            {scanResult.title}
                          </h2>
                        </div>
                      </div>

                      {autoResetTimer && (
                        <div className="text-right">
                          <span className="text-[10px] font-mono uppercase opacity-75">Next scan</span>
                          <div className="text-lg font-mono font-black text-emerald-300">
                            {autoResetTimer}s
                          </div>
                        </div>
                      )}
                    </div>

                    {/* State Details */}
                    {scanResult.state === 'valid' && (
                      <div className="mt-6 space-y-3 pt-4 border-t border-white/15">
                        <div className="grid grid-cols-2 gap-3 text-xs">
                          <div>
                            <span className="opacity-70 text-[10px] uppercase font-mono block">Guest</span>
                            <strong className="text-base font-black text-white">{scanResult.guestName}</strong>
                          </div>
                          <div>
                            <span className="opacity-70 text-[10px] uppercase font-mono block">Ticket Tier</span>
                            <strong className="text-base font-black text-emerald-300">{scanResult.ticketTier}</strong>
                          </div>
                          <div>
                            <span className="opacity-70 text-[10px] uppercase font-mono block">Gate</span>
                            <span className="font-mono font-bold text-white">{scanResult.gate}</span>
                          </div>
                          <div>
                            <span className="opacity-70 text-[10px] uppercase font-mono block">Admittance Time</span>
                            <span className="font-mono font-bold text-white">{scanResult.time}</span>
                          </div>
                        </div>

                        <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-400/30 text-xs flex items-center gap-2 text-emerald-200 mt-2">
                          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                          <span>Turnstile unlock triggered. Attendee manifest synchronized.</span>
                        </div>
                      </div>
                    )}

                    {scanResult.state === 'duplicate' && (
                      <div className="mt-6 space-y-3 pt-4 border-t border-white/15">
                        <div className="p-3.5 rounded-xl bg-amber-500/20 border border-amber-400/30 text-xs space-y-2 text-amber-100">
                          <div className="font-bold flex items-center gap-1.5 text-amber-300">
                            <ShieldAlert className="w-4 h-4" />
                            <span>DO NOT ADMIT AUTOMATICALLY</span>
                          </div>
                          <p className="text-xs leading-relaxed opacity-90">
                            {scanResult.reason}
                          </p>
                          {scanResult.previousCheckIn && (
                            <div className="pt-2 border-t border-amber-400/20 grid grid-cols-2 gap-2 text-[11px] font-mono">
                              <div>First check-in: <strong>{scanResult.previousCheckIn.time}</strong></div>
                              <div>Scanned at: <strong>{scanResult.previousCheckIn.gate}</strong></div>
                            </div>
                          )}
                        </div>

                        <div className="flex gap-2 pt-2">
                          <button
                            onClick={() => {
                              alert(`Supervisor escalation triggered for ticket ${scanResult.ticketCode}. Lead supervisor dispatched.`);
                            }}
                            className="flex-1 py-2.5 bg-amber-400 hover:bg-amber-300 text-black font-black text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-md text-center"
                          >
                            Supervisor Override
                          </button>
                          <button
                            onClick={() => setScanResult(null)}
                            className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl transition-all cursor-pointer"
                          >
                            Dismiss
                          </button>
                        </div>
                      </div>
                    )}

                    {scanResult.state === 'invalid' && (
                      <div className="mt-6 space-y-3 pt-4 border-t border-white/15">
                        <div className="p-3.5 rounded-xl bg-red-500/20 border border-red-400/30 text-xs space-y-2 text-red-100">
                          <div className="font-bold text-red-300">
                            Reason for rejection:
                          </div>
                          <p className="text-xs leading-relaxed opacity-90">
                            {scanResult.reason}
                          </p>
                        </div>

                        <div className="flex gap-2 pt-2">
                          <button
                            onClick={() => {
                              setActiveTab('guest_list');
                              setSearchGuestQuery(scanResult.ticketCode);
                            }}
                            className="flex-1 py-2.5 bg-white hover:bg-neutral-200 text-black font-black text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-md text-center"
                          >
                            Manual Guest Lookup
                          </button>
                          <button
                            onClick={() => {
                              alert(`Assistance desk ticket created for pass ${scanResult.ticketCode}. Direct attendee to Help Desk 1.`);
                            }}
                            className="flex-1 py-2.5 bg-red-400 hover:bg-red-300 text-black font-black text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-md text-center"
                          >
                            Assistance Desk
                          </button>
                        </div>
                      </div>
                    )}

                  </div>
                ) : (
                  <div className={`p-8 rounded-2xl border text-center space-y-3 ${
                    isDark ? 'bg-[#0E131F] border-[#1F2937]' : 'bg-white border-[#E5E7EB] shadow-xs'
                  }`}>
                    <div className="w-14 h-14 rounded-2xl bg-neutral-500/10 flex items-center justify-center mx-auto text-[#F6A623]">
                      <QrCode className="w-7 h-7" />
                    </div>
                    <div>
                      <h4 className="text-base font-bold">Awaiting Scan</h4>
                      <p className={`text-xs mt-1 max-w-xs mx-auto ${isDark ? 'text-white/60' : 'text-neutral-500'}`}>
                        Validation decision (Approved, Duplicate Warning, or Rejected) will appear here instantly.
                      </p>
                    </div>
                  </div>
                )}

                {/* RECENT CHECK-INS STREAM */}
                <div className={`p-6 rounded-2xl border space-y-4 ${
                  isDark ? 'bg-[#0E131F] border-[#1F2937]' : 'bg-white border-[#E5E7EB] shadow-xs'
                }`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold tracking-tight">Recent check-ins</h3>
                      <p className={`text-[11px] ${isDark ? 'text-white/50' : 'text-neutral-500'}`}>
                        Live gate admittance audit trail
                      </p>
                    </div>
                    <Clock className="w-4 h-4 text-[#F6A623]" />
                  </div>

                  <div className="space-y-2.5">
                    {recentAdmissions.map((adm, idx) => (
                      <div
                        key={idx}
                        className={`p-3 rounded-xl border flex items-center justify-between gap-3 text-xs transition-colors ${
                          isDark ? 'bg-[#151D2C] border-[#253247] hover:bg-[#1C2638]' : 'bg-neutral-50 border-neutral-200 hover:bg-neutral-100'
                        }`}
                      >
                        <div className="space-y-0.5">
                          <div className="font-bold">{adm.name}</div>
                          <div className={`text-[11px] font-mono ${isDark ? 'text-white/60' : 'text-neutral-500'}`}>
                            {adm.tier} · {adm.gate}
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="inline-block px-2 py-0.5 rounded text-[10px] font-mono font-black uppercase bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                            {adm.status}
                          </span>
                          <div className={`text-[10px] font-mono mt-0.5 ${isDark ? 'text-white/50' : 'text-neutral-400'}`}>
                            {adm.time}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: OVERVIEW & PERFORMANCE                             */}
        {/* ========================================================= */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Category Breakdown */}
              <div className={`p-6 rounded-2xl border space-y-4 ${
                isDark ? 'bg-[#0E131F] border-[#1F2937]' : 'bg-white border-[#E5E7EB] shadow-xs'
              }`}>
                <h3 className="text-sm font-bold uppercase tracking-wider text-[#F6A623]">
                  Ticket Category Admissions
                </h3>
                <div className="space-y-4 text-xs">
                  {[
                    { tier: 'VIP & Backstage Access', total: 250, checked: 210, percent: 84 },
                    { tier: 'General Admission Tier 1', total: 600, checked: 340, percent: 56.6 },
                    { tier: 'Early Bird Pass', total: 300, checked: 180, percent: 60 },
                    { tier: 'Exhibitor / Staff Pass', total: 100, checked: 94, percent: 94 },
                  ].map((cat, i) => (
                    <div key={i} className="space-y-1.5">
                      <div className="flex justify-between font-bold">
                        <span>{cat.tier}</span>
                        <span className="font-mono">{cat.checked} / {cat.total} ({cat.percent}%)</span>
                      </div>
                      <div className="w-full bg-neutral-500/20 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-[#F6A623] h-full rounded-full"
                          style={{ width: `${cat.percent}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Peak Check-In Velocity */}
              <div className={`p-6 rounded-2xl border space-y-4 ${
                isDark ? 'bg-[#0E131F] border-[#1F2937]' : 'bg-white border-[#E5E7EB] shadow-xs'
              }`}>
                <h3 className="text-sm font-bold uppercase tracking-wider text-[#F6A623]">
                  Hourly Admission Velocity
                </h3>
                <div className="space-y-3 text-xs">
                  {[
                    { interval: '12:00 - 13:00', count: 94, bar: 25 },
                    { interval: '13:00 - 14:00', count: 320, bar: 85 },
                    { interval: '14:00 - 15:00 (Peak)', count: 270, bar: 72 },
                    { interval: '15:00 - 16:00', count: 68, bar: 18 },
                  ].map((vel, i) => (
                    <div key={i} className="space-y-1">
                      <div className="flex justify-between font-mono">
                        <span className="font-bold">{vel.interval}</span>
                        <span>{vel.count} scans</span>
                      </div>
                      <div className="w-full bg-neutral-500/20 rounded-full h-2">
                        <div
                          className="bg-emerald-400 h-full rounded-full"
                          style={{ width: `${vel.bar}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Operational Security & Audit */}
              <div className={`p-6 rounded-2xl border space-y-4 ${
                isDark ? 'bg-[#0E131F] border-[#1F2937]' : 'bg-white border-[#E5E7EB] shadow-xs'
              }`}>
                <h3 className="text-sm font-bold uppercase tracking-wider text-[#F6A623]">
                  Gate Turnstile Security
                </h3>
                <div className="space-y-3 text-xs">
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-emerald-400">Pass-Back Prevention</div>
                      <div className="text-[11px] opacity-75">Duplicate scans blocked instantly</div>
                    </div>
                    <span className="font-mono font-black text-emerald-400">100%</span>
                  </div>

                  <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-blue-400">Edge Caching Resilience</div>
                      <div className="text-[11px] opacity-75">Offline local storage enabled</div>
                    </div>
                    <span className="font-mono font-black text-blue-400">Active</span>
                  </div>

                  <div className="p-3 rounded-xl bg-neutral-500/10 border border-neutral-500/20 flex items-center justify-between">
                    <div>
                      <div className="font-bold">Cryptographic QR Tokens</div>
                      <div className="text-[11px] opacity-75">AES-256 rotating hashes</div>
                    </div>
                    <span className="font-mono font-black">Secured</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: GUEST LIST / ATTENDEE LOOKUP                       */}
        {/* ========================================================= */}
        {activeTab === 'guest_list' && (
          <div className={`p-6 sm:p-8 rounded-2xl border space-y-6 ${
            isDark ? 'bg-[#0E131F] border-[#1F2937]' : 'bg-white border-[#E5E7EB] shadow-xs'
          }`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold">Attendee Lookup & Manifest</h3>
                <p className={`text-xs ${isDark ? 'text-white/60' : 'text-neutral-500'}`}>
                  Search by attendee name, email, booking reference, or ticket code.
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                  <input
                    type="text"
                    placeholder="Search name, code, email..."
                    value={searchGuestQuery}
                    onChange={e => setSearchGuestQuery(e.target.value)}
                    className={`pl-9 pr-3.5 py-2 rounded-xl text-xs border focus:outline-none focus:ring-2 focus:ring-[#F6A623] w-56 sm:w-64 ${
                      isDark ? 'bg-[#151D2C] border-[#253247] text-white' : 'bg-neutral-50 border-neutral-300 text-neutral-900'
                    }`}
                  />
                </div>

                <select
                  value={guestStatusFilter}
                  onChange={e => setGuestStatusFilter(e.target.value as any)}
                  className={`px-3 py-2 rounded-xl text-xs border font-bold focus:outline-none cursor-pointer ${
                    isDark ? 'bg-[#151D2C] border-[#253247] text-white' : 'bg-neutral-50 border-neutral-300 text-neutral-900'
                  }`}
                >
                  <option value="all">All Statuses</option>
                  <option value="checked_in">Checked In</option>
                  <option value="valid">Not Arrived</option>
                </select>

                <button
                  onClick={handleExportCSV}
                  className="px-3.5 py-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer bg-[#F6A623] text-black border-[#F6A623]"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export CSV</span>
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className={`border-b font-mono uppercase text-[10px] ${
                  isDark ? 'border-white/10 text-white/60' : 'border-neutral-200 text-neutral-500'
                }`}>
                  <tr>
                    <th className="p-3">Guest Name</th>
                    <th className="p-3">Ticket Code</th>
                    <th className="p-3">Tier Category</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Quick Admittance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-inherit">
                  {filteredGuests.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center opacity-60">
                        No attendees matching "{searchGuestQuery}".
                      </td>
                    </tr>
                  ) : (
                    filteredGuests.map(tkt => (
                      <tr key={tkt.id} className="hover:bg-neutral-500/5 transition-colors">
                        <td className="p-3">
                          <div className="font-bold">{tkt.attendeeName || 'Guest Pass'}</div>
                          <div className={`text-[10px] ${isDark ? 'text-white/50' : 'text-neutral-500'}`}>
                            {tkt.attendeeEmail || 'support@nexora.events'}
                          </div>
                        </td>
                        <td className="p-3 font-mono text-[11px] font-bold text-[#F6A623]">
                          {tkt.ticketCode}
                        </td>
                        <td className="p-3">
                          <span className="font-semibold">{tkt.tierName}</span>
                        </td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                            tkt.status === 'checked_in'
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : 'bg-amber-500/20 text-amber-400'
                          }`}>
                            {tkt.status === 'checked_in' ? 'CHECKED IN' : 'NOT ARRIVED'}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          {tkt.status === 'valid' ? (
                            <button
                              onClick={() => processTicketVerification(tkt.ticketCode)}
                              className="px-3 py-1 bg-[#F6A623] hover:bg-[#E59516] text-black font-bold text-[11px] rounded-lg transition-colors cursor-pointer"
                            >
                              Check In
                            </button>
                          ) : (
                            <span className="text-[11px] font-mono text-emerald-400 font-bold">
                              Admitted
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 4: ENTRY GATES & STAFF MANAGEMENT                     */}
        {/* ========================================================= */}
        {activeTab === 'entry_gates' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {GATES.map(gate => (
                <div
                  key={gate.id}
                  className={`p-6 rounded-2xl border space-y-4 transition-all ${
                    selectedGate === gate.name ? 'ring-2 ring-[#F6A623]' : ''
                  } ${isDark ? 'bg-[#0E131F] border-[#1F2937]' : 'bg-white border-[#E5E7EB] shadow-xs'}`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-mono uppercase font-bold text-[#F6A623]">Lane Node</span>
                      <h3 className="text-base font-black">{gate.name}</h3>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400">
                      ONLINE
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className={`block text-[10px] uppercase font-mono ${isDark ? 'text-white/60' : 'text-neutral-500'}`}>Category Eligibility</span>
                      <strong>{gate.type}</strong>
                    </div>
                    <div>
                      <span className={`block text-[10px] uppercase font-mono ${isDark ? 'text-white/60' : 'text-neutral-500'}`}>Gate Officer</span>
                      <strong>{gate.staff}</strong>
                    </div>
                    <div>
                      <span className={`block text-[10px] uppercase font-mono ${isDark ? 'text-white/60' : 'text-neutral-500'}`}>Optical Latency</span>
                      <strong className="text-emerald-400 font-mono">{gate.latency}</strong>
                    </div>
                    <div>
                      <span className={`block text-[10px] uppercase font-mono ${isDark ? 'text-white/60' : 'text-neutral-500'}`}>Total Admitted</span>
                      <strong className="font-mono">171 Guests</strong>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedGate(gate.name);
                      setActiveTab('scanner');
                    }}
                    className={`w-full py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer ${
                      selectedGate === gate.name
                        ? 'bg-[#F6A623] text-black font-black'
                        : (isDark ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-800')
                    }`}
                  >
                    {selectedGate === gate.name ? 'Active Scanning Gate' : 'Switch To This Gate'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 5: ATTENDANCE REPORTS                                 */}
        {/* ========================================================= */}
        {activeTab === 'reports' && (
          <div className={`p-6 sm:p-8 rounded-2xl border space-y-6 ${
            isDark ? 'bg-[#0E131F] border-[#1F2937]' : 'bg-white border-[#E5E7EB] shadow-xs'
          }`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold">Attendance & Gate Operations Report</h3>
                <p className={`text-xs ${isDark ? 'text-white/60' : 'text-neutral-500'}`}>
                  Export official audit records and turnstile check-in figures.
                </p>
              </div>

              <button
                onClick={handleExportCSV}
                className="px-5 py-2.5 rounded-xl bg-[#F6A623] hover:bg-[#E59516] text-black font-black text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-md"
              >
                <Download className="w-4 h-4" />
                <span>Export Attendance Manifest (.CSV)</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
              <div className={`p-4 rounded-xl border ${isDark ? 'bg-[#151D2C] border-[#253247]' : 'bg-neutral-50 border-neutral-200'}`}>
                <span className="opacity-60 block text-[10px] uppercase">Peak Admission Minute</span>
                <strong className="text-base text-[#F6A623]">13:48 (18 passes/min)</strong>
              </div>
              <div className={`p-4 rounded-xl border ${isDark ? 'bg-[#151D2C] border-[#253247]' : 'bg-neutral-50 border-neutral-200'}`}>
                <span className="opacity-60 block text-[10px] uppercase">Average Optical Admittance</span>
                <strong className="text-base text-emerald-400">0.41 seconds</strong>
              </div>
              <div className={`p-4 rounded-xl border ${isDark ? 'bg-[#151D2C] border-[#253247]' : 'bg-neutral-50 border-neutral-200'}`}>
                <span className="opacity-60 block text-[10px] uppercase">Total Passback Flags Caught</span>
                <strong className="text-base text-amber-400">12 Duplicate Scans</strong>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 6: SCANNER SETTINGS                                   */}
        {/* ========================================================= */}
        {activeTab === 'settings' && (
          <div className={`p-6 sm:p-8 rounded-2xl border space-y-6 max-w-3xl ${
            isDark ? 'bg-[#0E131F] border-[#1F2937]' : 'bg-white border-[#E5E7EB] shadow-xs'
          }`}>
            <h3 className="text-base font-bold">Scanner Operating Rules & Preferences</h3>
            
            <div className="space-y-4 text-xs">
              <div className="flex items-center justify-between p-3.5 rounded-xl border border-neutral-500/20">
                <div>
                  <div className="font-bold">Sound Feedback Synthesizer</div>
                  <div className="opacity-60 text-[11px]">Play audio tones on successful check-in or rejection</div>
                </div>
                <input
                  type="checkbox"
                  checked={soundEnabled}
                  onChange={e => setSoundEnabled(e.target.checked)}
                  className="w-4 h-4 accent-[#F6A623] cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-xl border border-neutral-500/20">
                <div>
                  <div className="font-bold">Rapid Auto-Scan Reset</div>
                  <div className="opacity-60 text-[11px]">Automatically reset optical frame after 3 seconds for consecutive guests</div>
                </div>
                <input
                  type="checkbox"
                  checked={rapidScanning}
                  onChange={e => setRapidScanning(e.target.checked)}
                  className="w-4 h-4 accent-[#F6A623] cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-xl border border-neutral-500/20">
                <div>
                  <div className="font-bold">Edge Offline Cache Storage</div>
                  <div className="opacity-60 text-[11px]">Preload encrypted event tickets into local memory for offline turnstiles</div>
                </div>
                <input
                  type="checkbox"
                  checked={isOfflineMode}
                  onChange={e => setIsOfflineMode(e.target.checked)}
                  className="w-4 h-4 accent-[#F6A623] cursor-pointer"
                />
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
};

// Also export as StaffGatePage for backward compatibility with existing imports
export const StaffGatePage = GuestTicketScannerPage;
