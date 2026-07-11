import { useEffect, useMemo, useState } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import api from '../utils/api';

type Range = '7' | '30' | '90';

function buildSeries(
  houses: { views?: number; title?: string; createdAt?: string }[],
  inquiries: { createdAt?: string }[],
  range: Range
) {
  const days = range === '7' ? 7 : range === '30' ? 30 : 90;
  const now = new Date();
  const labels: string[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    labels.push(d.toISOString().slice(0, 10));
  }

  const viewsByDay: Record<string, number> = {};
  labels.forEach((l) => {
    viewsByDay[l] = 0;
  });

  houses.forEach((h) => {
    const day = h.createdAt ? String(h.createdAt).slice(0, 10) : labels[0];
    if (viewsByDay[day] !== undefined) {
      viewsByDay[day] += h.views ?? 0;
    }
  });

  const inqByDay: Record<string, number> = {};
  labels.forEach((l) => {
    inqByDay[l] = 0;
  });
  inquiries.forEach((q) => {
    const day = q.createdAt ? String(q.createdAt).slice(0, 10) : '';
    if (day && inqByDay[day] !== undefined) inqByDay[day] += 1;
  });

  return labels.map((date) => ({
    date: date.slice(5),
    views: viewsByDay[date] ?? 0,
    inquiries: inqByDay[date] ?? 0,
  }));
}

function useIsDark() {
  const [dark, setDark] = useState(() =>
    typeof document !== 'undefined' ? document.documentElement.classList.contains('dark') : false
  );
  useEffect(() => {
    const root = document.documentElement;
    const sync = () => setDark(root.classList.contains('dark'));
    sync();
    const obs = new MutationObserver(sync);
    obs.observe(root, { attributes: true, attributeFilter: ['class'] });
    return () => obs.disconnect();
  }, []);
  return dark;
}

export default function OwnerAnalytics() {
  const [range, setRange] = useState<Range>('30');
  const [houses, setHouses] = useState<{ views?: number; title?: string; createdAt?: string }[]>([]);
  const [inquiries, setInquiries] = useState<{ createdAt?: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const isDark = useIsDark();

  const gridStroke = isDark ? '#334155' : '#E9ECEF';
  const tickFill = isDark ? '#94a3b8' : '#4B5563';

  useEffect(() => {
    (async () => {
      try {
        const [hRes, iRes] = await Promise.all([
          api.get('/houses/my-listings'),
          api.get('/inquiries/received'),
        ]);
        setHouses(hRes.data.data ?? []);
        setInquiries(iRes.data.data ?? []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const totalViews = useMemo(() => houses.reduce((s, h) => s + (h.views ?? 0), 0), [houses]);
  const totalInq = inquiries.length;
  const conversion = totalViews === 0 ? 0 : Math.round((totalInq / totalViews) * 1000) / 10;

  const chartData = useMemo(() => buildSeries(houses, inquiries, range), [houses, inquiries, range]);

  const topListings = useMemo(() => {
    return [...houses]
      .sort((a, b) => (b.views ?? 0) - (a.views ?? 0))
      .slice(0, 5)
      .map((h) => ({
        name: (h.title ?? 'Listing').slice(0, 24),
        views: h.views ?? 0,
      }));
  }, [houses]);

  const exportCsv = () => {
    const rows = [
      ['Metric', 'Value'],
      ['Total views', String(totalViews)],
      ['Total inquiries', String(totalInq)],
      ['Conversion %', String(conversion)],
    ];
    const blob = new Blob([rows.map((r) => r.join(',')).join('\n')], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'owner-analytics.csv';
    a.click();
  };

  if (loading) {
    return <div className="animate-pulse h-64 bg-surface dark:bg-slate-800 rounded-xl" />;
  }

  return (
    <div className="max-w-5xl mx-auto animate-fade-in space-y-6 sm:space-y-8 text-textPrimary dark:text-slate-100">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl sm:text-[28px] font-bold text-textPrimary dark:text-white">Analytics</h1>
        <div className="flex flex-wrap gap-2" role="tablist" aria-label="Date range">
          {(['7', '30', '90'] as Range[]).map((r) => (
            <button
              key={r}
              type="button"
              role="tab"
              aria-selected={range === r}
              onClick={() => setRange(r)}
              className={`px-3 sm:px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                range === r
                  ? 'border-brandTealDark dark:border-brandTeal bg-brandTeal/10 text-brandTealDark dark:text-brandTeal'
                  : 'border-border dark:border-slate-600 bg-white dark:bg-slate-800 text-textPrimary dark:text-slate-200'
              }`}
            >
              Last {r} days
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="card-container">
          <p className="text-sm text-textSecondary dark:text-slate-400">Total views</p>
          <p className="text-2xl sm:text-[32px] font-bold text-textPrimary dark:text-white">{totalViews}</p>
        </div>
        <div className="card-container">
          <p className="text-sm text-textSecondary dark:text-slate-400">Total inquiries</p>
          <p className="text-2xl sm:text-[32px] font-bold text-textPrimary dark:text-white">{totalInq}</p>
        </div>
        <div className="card-container">
          <p className="text-sm text-textSecondary dark:text-slate-400">Conversion</p>
          <p className="text-2xl sm:text-[32px] font-bold text-textPrimary dark:text-white">{conversion}%</p>
        </div>
        <div className="card-container">
          <p className="text-sm text-textSecondary dark:text-slate-400">Avg. response</p>
          <p className="text-2xl sm:text-[32px] font-bold text-textPrimary dark:text-white">—</p>
          <p className="text-xs text-textSecondary dark:text-slate-400 mt-1">Connect backend for timings</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-4 sm:gap-6">
        <div className="bg-white dark:bg-darksurface border border-border dark:border-slate-700 rounded-xl p-3 sm:p-4 h-72 sm:h-80">
          <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-textPrimary dark:text-white">
            Views over time
          </h2>
          <ResponsiveContainer width="100%" height="85%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: tickFill }} />
              <YAxis tick={{ fontSize: 11, fill: tickFill }} />
              <Tooltip
                contentStyle={{
                  background: isDark ? '#1e293b' : '#fff',
                  border: `1px solid ${isDark ? '#334155' : '#E9ECEF'}`,
                  color: isDark ? '#f1f5f9' : '#1A2B48',
                }}
              />
              <Legend />
              <Line type="monotone" dataKey="views" stroke="#149B9C" strokeWidth={2} dot={false} name="Views" />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white dark:bg-darksurface border border-border dark:border-slate-700 rounded-xl p-3 sm:p-4 h-72 sm:h-80">
          <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-textPrimary dark:text-white">
            Inquiries over time
          </h2>
          <ResponsiveContainer width="100%" height="85%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: tickFill }} />
              <YAxis tick={{ fontSize: 11, fill: tickFill }} />
              <Tooltip
                contentStyle={{
                  background: isDark ? '#1e293b' : '#fff',
                  border: `1px solid ${isDark ? '#334155' : '#E9ECEF'}`,
                  color: isDark ? '#f1f5f9' : '#1A2B48',
                }}
              />
              <Legend />
              <Bar dataKey="inquiries" fill="#28A745" name="Inquiries" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white dark:bg-darksurface border border-border dark:border-slate-700 rounded-xl p-3 sm:p-4 h-72 sm:h-80">
        <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-textPrimary dark:text-white">
          Top listings by views
        </h2>
        <ResponsiveContainer width="100%" height="85%">
          <BarChart data={topListings} layout="vertical" margin={{ left: 8, right: 16 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
            <XAxis type="number" tick={{ fill: tickFill, fontSize: 11 }} />
            <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 11, fill: tickFill }} />
            <Tooltip
              contentStyle={{
                background: isDark ? '#1e293b' : '#fff',
                border: `1px solid ${isDark ? '#334155' : '#E9ECEF'}`,
                color: isDark ? '#f1f5f9' : '#1A2B48',
              }}
            />
            <Bar dataKey="views" fill="#149B9C" name="Views" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="rounded-xl border border-dashed border-border dark:border-slate-600 bg-surface dark:bg-slate-800/50 p-4 sm:p-6 text-center text-textSecondary dark:text-slate-400 text-sm">
        Geographic view map can be added when view geo data is available from analytics API.
      </div>

      <button
        type="button"
        onClick={exportCsv}
        className="btn-secondary border-2 border-brandNavy dark:border-brandTeal text-brandNavy dark:text-brandTeal font-semibold"
      >
        Download CSV summary
      </button>
    </div>
  );
}
