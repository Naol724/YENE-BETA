import { Bell, Search, RefreshCw } from 'lucide-react';
import { useState, useEffect } from 'react';

const breadcrumbMap = {
    '/dashboard': ['Dashboard'],
    '/users': ['Users', 'All Users'],
    '/users/pending': ['Users', 'Pending Approvals'],
    '/listings': ['Listings', 'All Listings'],
    '/transactions': ['Transactions'],
    '/reports': ['Reports & Analytics'],
    '/settings': ['Settings'],
    '/notifications': ['Notifications'],
};

export default function TopBar({ collapsed, currentPath }) {
    const [time, setTime] = useState(new Date());
    const crumbs = breadcrumbMap[currentPath] || ['Dashboard'];

    useEffect(() => {
        const t = setInterval(() => setTime(new Date()), 60000);
        return () => clearInterval(t);
    }, []);

    const fmt = time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    const fmtDate = time.toLocaleDateString('en-KE', { weekday: 'short', month: 'short', day: 'numeric' });

    return (
        <header className={`topbar ${collapsed ? 'sidebar-collapsed' : ''}`}>
            <div className="breadcrumbs">
                <span>Admin</span>
                {crumbs.map((c, i) => (
                    <span key={i}>
                        <span className="sep"> / </span>
                        <span className={i === crumbs.length - 1 ? 'current' : ''}>{c}</span>
                    </span>
                ))}
            </div>
            <div className="topbar-right">
                <span className="topbar-time">{fmtDate} · {fmt}</span>
                <button className="topbar-icon-btn" title="Refresh data">
                    <RefreshCw size={18} />
                </button>
                <button className="topbar-icon-btn" title="Notifications">
                    <Bell size={18} />
                    <div className="notification-badge" />
                </button>
            </div>
        </header>
    );
}
