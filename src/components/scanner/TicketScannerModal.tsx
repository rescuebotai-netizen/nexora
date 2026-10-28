import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  QrCode, 
  Search, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Volume2, 
  Camera, 
  RefreshCw, 
  Users, 
  Clock,
  Wifi,
  WifiOff,
  CloudDownload,
  UploadCloud,
  ShieldAlert
} from 'lucide-react';
import { Event, CheckInLog } from '../../types';
import { store } from '../../lib/store';

interface TicketScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  events: Event[];
}

export const TicketScannerModal: React.FC<TicketScannerModalProps> = ({
  isOpen,
  onClose,
  events,
}) => {
  if (!isOpen) return null;

  const [selectedEventId, setSelectedEventId] = useState<string>(events[0]?.id || '');
  const [manualCode, setManualCode] = useState('');
  const [gateName, setGateName] = useState('Gate 1 — Main Entrance');
  const [staffName, setStaffName] = useState('Kwame Mensah');
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Offline Mode Engine (PRD Journey C)
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const [offlineCachedCount, setOfflineCachedCount] = useState(0);
  const [pendingOfflineQueue, setPendingOfflineQueue] = useState<Array<{ scannedPayload: string; eventId: string; staffName: string; gate: string; timestamp: string }>>([]);
  const [syncReport, setSyncReport] = useState<{ processed: number; conflicts: number } | null>(null);

  const [scanResult, setScanResult] = useState<CheckInLog | null>(null);
  const [scanHistory, setScanHistory] = useState<CheckInLog[]>([]);
  const [cameraActive, setCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    setScanHistory(store.getCheckInLogs(selectedEventId));
    // Cache tickets for this event
    const cached = store.cacheEventTicketsForOffline(selectedEventId);
    setOfflineCachedCount(cached.length);
  }, [selectedEventId]);

  // Audio synthesizer via Web Audio API
  const playSound = (type: 'success' | 'warning' | 'error') => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);

      if (type === 'success') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, audioCtx.currentTime);
        osc.frequency.setValueAtTime(880, audioCtx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.35);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.35);
      } else {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(220, audioCtx.currentTime);
        osc.frequency.setValueAtTime(160, audioCtx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.45);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.45);
      }
    } catch (e) {
      console.warn('Audio feedback error', e);
    }
  };

  const handleValidate = (codeToScan: string) => {
    if (!codeToScan.trim()) return;

    if (isOfflineMode) {
      // Offline local evaluation
      const cached = store.cacheEventTicketsForOffline(selectedEventId);
      const match = cached.find(t => t.code.toUpperCase() === codeToScan.trim().toUpperCase());

      // Queue for eventual server sync
      setPendingOfflineQueue(prev => [
        ...prev,
        {
          scannedPayload: codeToScan.trim(),
          eventId: selectedEventId,
          staffName,
          gate: gateName,
          timestamp: new Date().toISOString(),
        },
      ]);

      if (match) {
        if (match.status === 'refunded') {
          playSound('error');
          setScanResult({
            id: 'chk-off-' + Date.now(),
            ticketId: match.code,
            ticketCode: match.code,
            eventId: selectedEventId,
            timestamp: new Date().toISOString(),
            staffName,
            gate: gateName,
            result: 'refunded',
            message: 'OFFLINE ALERT: Pass marked as REFUNDED in local cache. Entry denied.',
            offlineSync: true,
          });
        } else {
          playSound('success');
          setScanResult({
            id: 'chk-off-' + Date.now(),
            ticketId: match.code,
            ticketCode: match.code,
            eventId: selectedEventId,
            timestamp: new Date().toISOString(),
            staffName,
            gate: gateName,
            result: 'valid',
            message: `OFFLINE ADMISSION: Verified ${match.name} (${match.tier}). Queued for sync.`,
            offlineSync: true,
          });
        }
      } else {
        playSound('error');
        setScanResult({
          id: 'chk-off-' + Date.now(),
          ticketId: 'unknown',
          ticketCode: codeToScan.trim(),
          eventId: selectedEventId,
          timestamp: new Date().toISOString(),
          staffName,
          gate: gateName,
          result: 'invalid',
          message: 'OFFLINE CHECK: Code not found in local authorized database.',
          offlineSync: true,
        });
      }
      setManualCode('');
      return;
    }

    // Online Authoritative Check
    const res = store.validateAndCheckIn({
      scannedPayload: codeToScan.trim(),
      eventId: selectedEventId,
      staffName,
      gate: gateName,
    });

    setScanResult(res);
    setScanHistory(store.getCheckInLogs(selectedEventId));
    setManualCode('');

    if (res.result === 'valid') {
      playSound('success');
    } else {
      playSound('error');
    }
  };

  // Sync Offline Queue
  const handleSyncOffline = () => {
    if (pendingOfflineQueue.length === 0) return;
    const report = store.syncOfflineScans(pendingOfflineQueue);
    setSyncReport({ processed: report.processed, conflicts: report.conflicts });
    setPendingOfflineQueue([]);
    setScanHistory(store.getCheckInLogs(selectedEventId));
    setTimeout(() => setSyncReport(null), 5000);
  };

  const startCamera = async () => {
    try {
      setCameraActive(true);
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      }
    } catch (err) {
      console.warn('Camera could not be accessed, fallback to optical viewfinder', err);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(t => t.stop());
    }
    setCameraActive(false);
  };

  const allTickets = store.getTickets();
  const sampleValidTicket = allTickets.find(t => t.status === 'valid' && (!selectedEventId || t.eventId === selectedEventId));
  const sampleCheckedInTicket = allTickets.find(t => t.status === 'checked_in');
  const sampleRefundedTicket = allTickets.find(t => t.status === 'refunded');

  const checkedInCount = scanHistory.filter(h => h.result === 'valid').length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-[#111827]/90 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-[#E5E7EB] overflow-hidden my-auto max-h-[95vh] flex flex-col">
        
        {/* Header */}
        <div className="px-6 py-4 bg-[#111827] text-white flex items-center justify-between border-b border-[#1F2937]">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#F6A623] text-[#111827] rounded-lg">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white leading-tight">
                  Guest Ticket Scanner
                </h3>
                {isOfflineMode ? (
                  <span className="flex items-center gap-1 text-[10px] bg-amber-950 text-amber-300 font-mono font-bold px-2 py-0.5 rounded border border-amber-800">
                    <WifiOff className="w-3 h-3" />
                    Offline Cache Mode
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-[10px] bg-emerald-950 text-emerald-300 font-mono font-bold px-2 py-0.5 rounded border border-emerald-800">
                    <Wifi className="w-3 h-3" />
                    Online Cloud Authoritative
                  </span>
                )}
              </div>
              <p className="text-xs text-[#9CA3AF]">
                Sub-second cryptographic admittance engine with offline sync & passback protection
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Offline toggle */}
            <button
              onClick={() => setIsOfflineMode(!isOfflineMode)}
              className={`px-3 py-1.5 rounded-lg border text-xs flex items-center gap-1.5 transition-colors cursor-pointer ${
                isOfflineMode
                  ? 'bg-amber-600 text-white border-amber-500 font-bold'
                  : 'bg-[#1F2937] border-[#374151] text-[#E5E7EB]'
              }`}
              title="Toggle offline gate caching"
            >
              {isOfflineMode ? <WifiOff className="w-3.5 h-3.5" /> : <Wifi className="w-3.5 h-3.5" />}
              <span>{isOfflineMode ? 'Offline Mode Active' : 'Go Offline'}</span>
            </button>

            {/* Audio Toggle */}
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`p-2 rounded-lg border text-xs flex items-center gap-1.5 transition-colors cursor-pointer ${
                soundEnabled
                  ? 'bg-[#1F2937] border-[#374151] text-[#F6A623]'
                  : 'bg-transparent border-[#374151] text-[#6B7280]'
              }`}
            >
              <Volume2 className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                stopCamera();
                onClose();
              }}
              className="p-1.5 text-[#9CA3AF] hover:text-white rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Sub-bar: Event selector, Gate info & Offline queue sync */}
        <div className="px-6 py-3 bg-[#F8F7F4] border-b border-[#E5E7EB] flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-[#4B5563]">Active Event:</span>
            <select
              value={selectedEventId}
              onChange={e => setSelectedEventId(e.target.value)}
              className="bg-white border border-[#D1D5DB] rounded-lg px-2.5 py-1 text-xs font-bold text-[#111827] focus:outline-none"
            >
              {events.map(e => (
                <option key={e.id} value={e.id}>
                  {e.title} ({e.venue.city})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-4 text-[#6B7280]">
            <div>
              <span>Gate: </span>
              <strong className="text-[#111827]">{gateName}</strong>
            </div>
            <div>
              <span>Staff: </span>
              <strong className="text-[#111827]">{staffName}</strong>
            </div>

            {/* Offline Sync CTA if items in queue */}
            {pendingOfflineQueue.length > 0 && (
              <button
                onClick={handleSyncOffline}
                className="px-3 py-1 bg-[#111827] text-white hover:bg-[#1F2937] rounded-lg font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <UploadCloud className="w-3.5 h-3.5 text-[#F6A623]" />
                <span>Sync {pendingOfflineQueue.length} Scans</span>
              </button>
            )}
          </div>
        </div>

        {/* Offline Sync Report Alert */}
        {syncReport && (
          <div className="px-6 py-2 bg-blue-50 border-b border-blue-200 text-blue-900 text-xs flex items-center justify-between">
            <span>
              Synchronized {syncReport.processed} offline scans. {syncReport.conflicts} duplicate passback conflicts caught.
            </span>
            <button onClick={() => setSyncReport(null)} className="text-blue-600 hover:underline">Dismiss</button>
          </div>
        )}

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Optical Viewfinder & Code Input */}
          <div className="lg:col-span-7 space-y-5">
            
            {/* Viewfinder Frame */}
            <div className="relative aspect-[4/3] w-full bg-[#111827] rounded-2xl overflow-hidden border border-[#1F2937] flex flex-col items-center justify-center text-white">
              {cameraActive ? (
                <>
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-10 border-2 border-[#F6A623]/70 rounded-2xl pointer-events-none flex items-center justify-center">
                    <div className="w-full h-0.5 bg-[#F6A623] shadow-lg animate-pulse" />
                  </div>
                </>
              ) : (
                <div className="text-center p-6 space-y-3">
                  <div className="w-16 h-16 rounded-2xl bg-[#1F2937] border border-[#374151] flex items-center justify-center mx-auto text-[#F6A623]">
                    <Camera className="w-8 h-8" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Optical QR Camera Feed</h4>
                    <p className="text-xs text-[#9CA3AF] max-w-xs mx-auto mt-0.5">
                      {isOfflineMode
                        ? `Operating in offline mode with ${offlineCachedCount} authorized tickets cached locally.`
                        : 'Active online connection with live gate sync.'}
                    </p>
                  </div>
                  <button
                    onClick={startCamera}
                    className="px-4 py-2 bg-[#F6A623] hover:bg-[#E59516] text-[#111827] font-bold text-xs rounded-lg transition-colors cursor-pointer inline-flex items-center gap-2"
                  >
                    <Camera className="w-4 h-4" />
                    <span>Launch Camera Scanner</span>
                  </button>
                </div>
              )}
            </div>

            {/* Manual Code Input Bar */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[#4B5563]">
                Manual Ticket Code / QR Lookup
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={manualCode}
                  onChange={e => setManualCode(e.target.value.toUpperCase())}
                  placeholder="e.g. NX-TKT-94821 or NX-849201"
                  className="flex-1 px-3.5 py-2.5 bg-white border border-[#D1D5DB] rounded-lg text-sm font-mono tracking-wider focus:outline-none focus:border-[#F6A623]"
                  onKeyDown={e => e.key === 'Enter' && handleValidate(manualCode)}
                />
                <button
                  onClick={() => handleValidate(manualCode)}
                  disabled={!manualCode.trim()}
                  className="px-5 py-2.5 bg-[#111827] hover:bg-[#1F2937] disabled:bg-[#9CA3AF] text-white font-bold text-xs rounded-lg transition-colors cursor-pointer"
                >
                  Verify Code
                </button>
              </div>
            </div>

            {/* Test Scenarios */}
            <div className="p-3.5 bg-[#F8F7F4] rounded-xl border border-[#E5E7EB] space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#6B7280] block">
                Instant Verification Scenarios (Click to test acceptance criteria)
              </span>
              <div className="flex flex-wrap gap-2">
                {sampleValidTicket && (
                  <button
                    onClick={() => handleValidate(sampleValidTicket.ticketCode)}
                    className="px-3 py-1.5 bg-white hover:bg-emerald-50 text-emerald-800 border border-emerald-300 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                  >
                    Valid Pass ({sampleValidTicket.ticketCode})
                  </button>
                )}
                {sampleCheckedInTicket && (
                  <button
                    onClick={() => handleValidate(sampleCheckedInTicket.ticketCode)}
                    className="px-3 py-1.5 bg-white hover:bg-amber-50 text-amber-800 border border-amber-300 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                  >
                    Duplicate / Passback ({sampleCheckedInTicket.ticketCode})
                  </button>
                )}
                {sampleRefundedTicket && (
                  <button
                    onClick={() => handleValidate(sampleRefundedTicket.ticketCode)}
                    className="px-3 py-1.5 bg-white hover:bg-red-50 text-red-800 border border-red-300 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                  >
                    Refunded Pass ({sampleRefundedTicket.ticketCode})
                  </button>
                )}
                <button
                  onClick={() => handleValidate('FAKE-CODE-99999')}
                  className="px-3 py-1.5 bg-white hover:bg-red-50 text-red-800 border border-red-300 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                >
                  Fraud / Invalid Token
                </button>
              </div>
            </div>

          </div>

          {/* Right Column: Scan Result & Real-Time Gate Logs */}
          <div className="lg:col-span-5 space-y-5">
            
            {/* Live Scan Status Card */}
            {scanResult ? (
              <div
                className={`p-5 rounded-2xl border text-white transition-all shadow-lg animate-in zoom-in-95 duration-200 ${
                  scanResult.result === 'valid'
                    ? 'bg-emerald-950 border-emerald-700'
                    : scanResult.result === 'already_checked_in'
                    ? 'bg-amber-950 border-amber-700'
                    : 'bg-red-950 border-red-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  {scanResult.result === 'valid' ? (
                    <CheckCircle2 className="w-8 h-8 text-emerald-400 shrink-0" />
                  ) : scanResult.result === 'already_checked_in' ? (
                    <AlertTriangle className="w-8 h-8 text-amber-400 shrink-0" />
                  ) : (
                    <XCircle className="w-8 h-8 text-red-400 shrink-0" />
                  )}
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-widest opacity-80">
                      Admission Result
                    </span>
                    <h4 className="text-base font-extrabold capitalize">
                      {scanResult.result.replace(/_/g, ' ')}
                    </h4>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-white/10 text-xs leading-relaxed">
                  {scanResult.message}
                </div>

                <div className="mt-3 text-[11px] font-mono opacity-70 flex justify-between">
                  <span>Code: {scanResult.ticketCode}</span>
                  <span>{new Date(scanResult.timestamp).toLocaleTimeString()}</span>
                </div>
              </div>
            ) : (
              <div className="p-5 rounded-2xl border border-dashed border-[#D1D5DB] bg-[#F8F7F4] text-center text-[#6B7280] space-y-1">
                <QrCode className="w-8 h-8 mx-auto text-[#9CA3AF]" />
                <p className="text-xs font-semibold">Ready for turnstile scans</p>
                <p className="text-[11px]">Scan an attendee pass to see admission details.</p>
              </div>
            )}

            {/* Gate Admittance Counter */}
            <div className="p-4 bg-[#111827] text-white rounded-xl border border-[#1F2937] space-y-2">
              <div className="flex items-center justify-between text-xs text-[#9CA3AF]">
                <span className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-[#F6A623]" />
                  <span>Gate Admittance</span>
                </span>
                <span className="font-mono text-white font-bold">{checkedInCount} Admitted</span>
              </div>
              <div className="w-full bg-[#1F2937] h-2 rounded-full overflow-hidden">
                <div
                  className="bg-[#F6A623] h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, Math.max(12, checkedInCount * 14))}%` }}
                />
              </div>
            </div>

            {/* Scan History Feed */}
            <div className="space-y-2">
              <h5 className="text-xs font-bold uppercase tracking-wider text-[#6B7280] flex items-center justify-between">
                <span>Recent Gate Activity ({scanHistory.length})</span>
                <Clock className="w-3.5 h-3.5" />
              </h5>

              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {scanHistory.length === 0 ? (
                  <div className="text-xs text-[#9CA3AF] italic text-center py-4">
                    No scans recorded yet for this session.
                  </div>
                ) : (
                  scanHistory.slice(0, 10).map(log => (
                    <div
                      key={log.id}
                      className="p-2.5 bg-white border border-[#E5E7EB] rounded-lg text-xs flex items-center justify-between gap-2 shadow-xs"
                    >
                      <div className="space-y-0.5 truncate">
                        <div className="font-mono font-bold text-[#111827] truncate">
                          {log.ticketCode}
                        </div>
                        <div className="text-[11px] text-[#6B7280] truncate">
                          {log.gate} · {log.staffName}
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded font-mono ${
                            log.result === 'valid'
                              ? 'bg-emerald-100 text-emerald-800'
                              : log.result === 'already_checked_in'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {log.result === 'valid' ? 'Admitted' : 'Rejected'}
                        </span>
                        <div className="text-[10px] text-[#9CA3AF] mt-0.5">
                          {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
