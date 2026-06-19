'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface SpeedData {
  time: string;
  download: number;
  upload: number;
  ping: number;
}

interface IpInfo {
  ip: string;
  isp: string;
  city: string;
  country: string;
}

interface ServiceStatus {
  name: string;
  icon: string;
  status: 'online' | 'offline' | 'slow';
  latency: number;
}

function AnimatedNumber({ value, suffix = '', className = '' }: { value: number; suffix?: string; className?: string }) {
  const [display, setDisplay] = useState(value);
  const prevValue = useRef(value);

  useEffect(() => {
    const duration = 500;
    const startTime = performance.now();
    const startValue = prevValue.current;

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = startValue + (value - startValue) * eased;
      setDisplay(current);
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setDisplay(value);
        prevValue.current = value;
      }
    };
    requestAnimationFrame(animate);
  }, [value]);

  return (
    <span className={className}>
      {display.toFixed(1)} {suffix}
    </span>
  );
}

export default function InternetMonitoringPage() {
  const [ipInfo, setIpInfo] = useState<IpInfo | null>(null);
  const [history, setHistory] = useState<SpeedData[]>([]);
  const [currentSpeed, setCurrentSpeed] = useState<SpeedData | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [services, setServices] = useState<ServiceStatus[]>([
    { name: 'Telegram', icon: '✈️', status: 'online', latency: 85 },
    { name: 'Instagram', icon: '📸', status: 'online', latency: 120 },
    { name: 'WhatsApp', icon: '💬', status: 'online', latency: 95 },
    { name: 'YouTube', icon: '▶️', status: 'online', latency: 150 },
  ]);

  useEffect(() => {
    const fetchIpInfo = async () => {
      try {
        const res = await fetch('https://ip-api.com/json/?fields=status,message,country,city,isp,query');
        const data = await res.json();
        if (data.status === 'success') {
          setIpInfo({
            ip: data.query,
            isp: data.isp || 'Unknown',
            city: data.city || 'Unknown',
            country: data.country || 'Unknown',
          });
        }
      } catch (error) {
        console.error('Failed to fetch location info:', error);
      }
    };
    fetchIpInfo();
  }, []);

  const runSpeedTest = useCallback(() => {
    if (isTesting) return;
    setIsTesting(true);

    const newData: SpeedData = {
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      download: Math.round((15 + Math.random() * 85) * 10) / 10,
      upload: Math.round((4 + Math.random() * 31) * 10) / 10,
      ping: Math.round(12 + Math.random() * 70),
    };

    setCurrentSpeed(newData);
    setHistory((prev) => {
      const updated = [...prev, newData];
      return updated.length > 30 ? updated.slice(-30) : updated;
    });

    setServices((prev) =>
      prev.map((svc) => ({
        ...svc,
        status: Math.random() > 0.85 ? 'offline' : Math.random() > 0.7 ? 'slow' : 'online',
        latency: Math.round(40 + Math.random() * 160),
      }))
    );

    setTimeout(() => setIsTesting(false), 800);
  }, [isTesting]);

  useEffect(() => {
    runSpeedTest();
    const interval = setInterval(runSpeedTest, 12000);
    return () => clearInterval(interval);
  }, [runSpeedTest]);

  return (
    <main
      className="min-h-screen bg-gradient-to-br from-slate-950 via-gray-900 to-slate-950 text-gray-200 p-4 md:p-8 font-sans overflow-x-hidden"
      dir="ltr"
    >
      <div className="max-w-7xl mx-auto space-y-6 animate-fadeIn">

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-800/60 pb-5 backdrop-blur-sm bg-gray-900/30 rounded-2xl p-5 -mx-2">
          <div className="space-y-1">
            <h1 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent">
              📡 Iran Internet Monitoring
            </h1>
            <p className="text-gray-400 text-sm flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Real-time status and speed trends
            </p>
          </div>
          <button
            onClick={runSpeedTest}
            disabled={isTesting}
            className="relative px-7 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:from-gray-600 disabled:to-gray-700 rounded-xl font-medium transition-all duration-300 shadow-lg shadow-blue-900/40 hover:shadow-blue-700/30 flex items-center gap-2 group overflow-hidden"
          >
            {isTesting ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Testing...
              </>
            ) : (
              <>
                <span className="relative z-10">🔄 Test Again</span>
                <span className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-indigo-400/20 blur-xl group-hover:blur-2xl transition-all duration-500" />
              </>
            )}
          </button>
        </div>

        {ipInfo && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-slideUp">
            {[
              { icon: '🌐', label: 'IP Address', value: ipInfo.ip, color: 'text-blue-300' },
              { icon: '🏢', label: 'ISP', value: ipInfo.isp, color: 'text-cyan-300' },
              { icon: '📍', label: 'Location', value: `${ipInfo.city}, ${ipInfo.country}`, color: 'text-emerald-300' },
              { icon: '🕒', label: 'Last Update', value: currentSpeed?.time || '---', color: 'text-amber-300' },
            ].map((item, idx) => (
              <div
                key={idx}
                className="glass-card p-4 rounded-xl border border-white/10 backdrop-blur-md bg-white/5 hover:bg-white/10 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl"
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{item.icon}</span>
                  <div>
                    <p className="text-xs text-gray-400">{item.label}</p>
                    <p className={`font-bold truncate ${item.color}`}>{item.value}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 animate-slideUp" style={{ animationDelay: '150ms' }}>
          {[
            { label: '📥 Download', key: 'download', color: 'text-blue-400', bg: 'from-blue-900/30 to-blue-950/50', border: 'border-blue-800/40' },
            { label: '📤 Upload', key: 'upload', color: 'text-green-400', bg: 'from-green-900/30 to-green-950/50', border: 'border-green-800/40' },
            { label: '📡 Ping (Latency)', key: 'ping', color: 'text-red-400', bg: 'from-red-900/30 to-red-950/50', border: 'border-red-800/40' },
          ].map((item, idx) => {
            const value = currentSpeed?.[item.key as keyof SpeedData] ?? 0;
            const suffix = item.key === 'ping' ? 'ms' : 'Mbps';
            return (
              <div
                key={idx}
                className={`glass-card bg-gradient-to-br ${item.bg} p-6 rounded-xl border ${item.border} shadow-xl shadow-black/20 backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl`}
              >
                <p className="text-gray-300 text-sm flex items-center gap-2">{item.label}</p>
                <div className="mt-2">
                  <span className={`text-4xl font-bold ${item.color}`}>
                    <AnimatedNumber value={value} suffix={suffix} />
                  </span>
                </div>
                {/* Progress bar */}
                <div className="mt-3 h-1.5 w-full bg-gray-700/50 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${
                      item.key === 'download'
                        ? 'bg-gradient-to-l from-blue-400 to-cyan-300'
                        : item.key === 'upload'
                        ? 'bg-gradient-to-l from-green-400 to-emerald-300'
                        : 'bg-gradient-to-l from-red-400 to-rose-300'
                    }`}
                    style={{
                      width: item.key === 'ping' ? `${Math.min((value / 150) * 100, 100)}%` : `${Math.min((value / 120) * 100, 100)}%`,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        <div className="glass-card bg-white/5 backdrop-blur-md p-5 rounded-xl border border-white/10 animate-slideUp" style={{ animationDelay: '250ms' }}>
          <h3 className="text-md font-semibold text-gray-300 mb-4 flex items-center gap-2">
            🌍 Popular Services Status
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {services.map((svc, idx) => (
              <div
                key={idx}
                className={`p-4 rounded-xl text-center transition-all duration-300 hover:scale-105 ${
                  svc.status === 'online'
                    ? 'bg-emerald-900/20 border border-emerald-700/30'
                    : svc.status === 'slow'
                    ? 'bg-amber-900/20 border border-amber-700/30'
                    : 'bg-red-900/20 border border-red-700/30'
                }`}
              >
                <div className="text-3xl">{svc.icon}</div>
                <div className="text-sm mt-1 font-medium">{svc.name}</div>
                <div
                  className={`text-xs mt-1 ${
                    svc.status === 'online'
                      ? 'text-emerald-400'
                      : svc.status === 'slow'
                      ? 'text-amber-400'
                      : 'text-red-400'
                  }`}
                >
                  {svc.status === 'online' && '✅ Online'}
                  {svc.status === 'slow' && '⚠️ Slow'}
                  {svc.status === 'offline' && '❌ Offline'}
                </div>
                <div className="text-[10px] text-gray-400 mt-0.5">Latency: {svc.latency}ms</div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card bg-white/5 backdrop-blur-md p-4 rounded-xl border border-white/10 animate-slideUp" style={{ animationDelay: '350ms' }}>
          <div className="flex flex-wrap justify-between items-center mb-4 px-2">
            <h2 className="text-lg font-semibold text-gray-300 flex items-center gap-2">
              📈 Speed Trend (Last 30 Tests)
            </h2>
            <span className="text-xs text-gray-400 bg-gray-800/50 px-3 py-1 rounded-full border border-gray-700/50">
              Each dot = 1 test
            </span>
          </div>
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={history} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" strokeOpacity={0.5} />
              <XAxis dataKey="time" tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <YAxis
                yAxisId="left"
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                label={{ value: 'Mbps', angle: -90, position: 'insideLeft', fill: '#94a3b8', fontSize: 10 }}
                domain={[0, 120]}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                label={{ value: 'ms', angle: 90, position: 'insideRight', fill: '#94a3b8', fontSize: 10 }}
                domain={[0, 100]}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(30, 41, 59, 0.9)',
                  backdropFilter: 'blur(8px)',
                  borderColor: '#475569',
                  borderRadius: '12px',
                  color: '#e2e8f0',
                  fontSize: '13px',
                  padding: '12px 16px',
                  boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
                }}
                formatter={(value: number, name: string) => {
                  const labels: Record<string, string> = {
                    download: '📥 Download',
                    upload: '📤 Upload',
                    ping: '📡 Ping',
                  };
                  const units: Record<string, string> = {
                    download: 'Mbps',
                    upload: 'Mbps',
                    ping: 'ms',
                  };
                  return [`${value} ${units[name] || ''}`, labels[name] || name];
                }}
                labelFormatter={(label) => `⏱️ ${label}`}
              />
              <Legend
                wrapperStyle={{ color: '#cbd5e1', fontSize: '12px', paddingTop: '8px' }}
                formatter={(value) => {
                  const map: Record<string, string> = {
                    download: '📥 Download',
                    upload: '📤 Upload',
                    ping: '📡 Ping',
                  };
                  return map[value] || value;
                }}
              />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="download"
                stroke="#60a5fa"
                strokeWidth={3}
                dot={{ fill: '#60a5fa', r: 4 }}
                activeDot={{ r: 7, stroke: '#93c5fd', strokeWidth: 2 }}
                animationDuration={800}
              />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="upload"
                stroke="#4ade80"
                strokeWidth={3}
                dot={{ fill: '#4ade80', r: 4 }}
                activeDot={{ r: 7, stroke: '#86efac', strokeWidth: 2 }}
                animationDuration={800}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="ping"
                stroke="#f87171"
                strokeWidth={2}
                dot={{ fill: '#f87171', r: 3 }}
                strokeDasharray="5 5"
                animationDuration={800}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-8 text-center text-gray-500 text-xs border-t border-gray-800/50 pt-5 space-y-1">
          <p>
            ⚡ Speed data is <span className="text-amber-400/80 font-medium">simulated</span> for demonstration purposes.
          </p>
          <p className="text-gray-600">
            To connect to a real API, edit the <code className="bg-gray-800/70 px-2 py-0.5 rounded text-blue-300 text-[10px]">runSpeedTest</code> function.
          </p>
        </div>
      </div>

      {/* ==================== GLOBAL STYLES ==================== */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.6s ease-out forwards;
        }
        .animate-slideUp {
          opacity: 0;
          animation: slideUp 0.5s ease-out forwards;
        }
        .glass-card {
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.06);
          transition: all 0.3s ease;
        }
        .glass-card:hover {
          background: rgba(255, 255, 255, 0.07);
          border-color: rgba(255, 255, 255, 0.12);
        }
      `}</style>
    </main>
  );
}