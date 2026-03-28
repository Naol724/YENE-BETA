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

export default function OwnerAnalytics() {
  const [range, setRange] = useState<Range>('30');
  const [houses, setHouses] = useState<{ views?: number; title?: string; createdAt?: string }[]>([]);
  const [inquiries, setInquiries] = useState<{ createdAt?: string }[]>([]);
  const [loading, setLoading] = useState(true);

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
    const rows = [['Metric', 'Value'], ['Total views', String(totalViews)], ['Total inquiries', String(totalInq)], ['Conversion %', String(conversion)]];
    const blob = new Blob([rows.map((r) => r.join(',')).join('\n')], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'owner-analytics.csv';
    a.click();
  };

  if (loading) {
    return <div className="animate-pulse h-64 bg-surface rounded-xl" />;
  }

  return (
    <div className="max-w-5xl mx-auto animate-fade-in space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-[28px] font-bold">Analytics</h1>
        <div className="flex flex-wrap gap-2" role="tablist" aria-label="Date range">
          {(['7', '30', '90'] as Range[]).map((r) => (
            <button
              key={r}
              type="button"
              role="tab"
              aria-selected={range === r}
              onClick={() => setRange(r)}
              className={`px-4 py-2 rounded-lg text-sm font-medium border ${
                range === r ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-white'
              }`}
            >
              Last {r} days
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="card-container">
          <p className="text-sm text-textSecondary">Total views</p>
          <p className="text-[32px] font-bold">{totalViews}</p>
        </div>
        <div className="card-container">
          <p className="text-sm text-textSecondary">Total inquiries</p>
          <p className="text-[32px] font-bold">{totalInq}</p>
        </div>
        <div className="card-container">
          <p className="text-sm text-textSecondary">Conversion</p>
          <p className="text-[32px] font-bold">{conversion}%</p>
        </div>
        <div className="card-container">
          <p className="text-sm text-textSecondary">Avg. response</p>
          <p className="text-[32px] font-bold">—</p>
          <p className="text-xs text-textSecondary mt-1">Connect backend for timings</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white border border-border rounded-xl p-4 h-80">
          <h2 className="text-lg font-semibold mb-4">Views over time</h2>
          <ResponsiveContainer width="100%" height="85%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E9ECEF" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="views" stroke="#0066CC" strokeWidth={2} dot={false} name="Views" />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white border border-border rounded-xl p-4 h-80">
          <h2 className="text-lg font-semibold mb-4">Inquiries over time</h2>
          <ResponsiveContainer width="100%" height="85%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E9ECEF" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="inquiries" fill="#28A745" name="Inquiries" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white border border-border rounded-xl p-4 h-80">
        <h2 className="text-lg font-semibold mb-4">Top listings by views</h2>
        <ResponsiveContainer width="100%" height="85%">
          <BarChart data={topListings} layout="vertical" margin={{ left: 16, right: 16 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E9ECEF" />
            <XAxis type="number" />
            <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 11 }} />
            <Tooltip />
            <Bar dataKey="views" fill="#0066CC" name="Views" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="rounded-xl border border-dashed border-border bg-surface p-6 text-center text-textSecondary text-sm">
        Geographic view map can be added when view geo data is available from analytics API.
      </div>

      <button type="button" onClick={exportCsv} className="btn-secondary !bg-white !text-primary border-2 border-primary">
        Download CSV summary
      </button>
    </div>
  );
}
