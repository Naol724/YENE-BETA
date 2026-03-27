import { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

export default function Layout({ onLogout }) {
    const [collapsed, setCollapsed] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    const handleLogout = () => {
        onLogout();
        navigate('/');
    };

    return (
        <div className="app-layout">
            <Sidebar collapsed={collapsed} onCollapse={() => setCollapsed(!collapsed)} onLogout={handleLogout} currentPath={location.pathname} />
            <div className={`main-content ${collapsed ? 'sidebar-collapsed' : ''}`}>
                <TopBar collapsed={collapsed} currentPath={location.pathname} />
                <main className="page-wrapper">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
