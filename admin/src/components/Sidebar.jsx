import { useNavigate } from 'react-router-dom';
import {
    LayoutDashboard, Users, Home, CreditCard, BarChart3,
    Settings, Bell, ChevronLeft, ChevronRight, LogOut, Clock, UserCheck
} from 'lucide-react';

const nav = [
    {
        section: 'Main', items: [
            { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
        ]
    },
    {
        section: 'Management', items: [
            { label: 'All Users', icon: Users, path: '/users' },
            { label: 'Pending Approvals', icon: UserCheck, path: '/users/pending' },
            { label: 'House Listings', icon: Home, path: '/listings' },
            { label: 'Transactions', icon: CreditCard, path: '/transactions' },
        ]
    },
    {
        section: 'Analytics', items: [
            { label: 'Reports', icon: BarChart3, path: '/reports' },
            { label: 'Notifications', icon: Bell, path: '/notifications' },
        ]
    },
    {
        section: 'System', items: [
            { label: 'Settings', icon: Settings, path: '/settings' },
        ]
    },
];

export default function Sidebar({ collapsed, onCollapse, onLogout, currentPath }) {
    const navigate = useNavigate();
    const isActive = (path) => currentPath === path || (path !== '/dashboard' && currentPath.startsWith(path));

    return (
        <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
            <button className="toggle-btn" onClick={onCollapse} title={collapsed ? 'Expand' : 'Collapse'}>
                {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
            </button>

            <div className="sidebar-brand">
                <div className="brand-icon">
                    <Home size={18} />
                </div>
                {!collapsed && (
                    <div className="brand-text">
                        <h2>House Rental</h2>
                        <p>Admin Portal</p>
                    </div>
                )}
            </div>

            <nav className="sidebar-nav">
                {nav.map((group) => (
                    <div key={group.section}>
                        {!collapsed && <div className="nav-section-label">{group.section}</div>}
                        {group.items.map((item) => {
                            const Icon = item.icon;
                            const active = isActive(item.path);
                            return (
                                <div
                                    key={item.path}
                                    className={`nav-item ${active ? 'active' : ''}`}
                                    onClick={() => navigate(item.path)}
                                    title={collapsed ? item.label : ''}
                                >
                                    <Icon size={18} />
                                    {!collapsed && <span>{item.label}</span>}
                                </div>
                            );
                        })}
                    </div>
                ))}
            </nav>

            <div className="sidebar-footer">
                {!collapsed && (
                    <div className="admin-info">
                        <div className="admin-avatar">A</div>
                        <div className="admin-details">
                            <h4>Admin User</h4>
                            <p>admin@houserental.com</p>
                        </div>
                    </div>
                )}
                <button className="logout-btn" onClick={onLogout} title={collapsed ? 'Logout' : ''}>
                    <LogOut size={16} />
                    {!collapsed && <span>Logout</span>}
                </button>
            </div>
        </aside>
    );
}
