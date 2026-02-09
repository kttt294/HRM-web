import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Sidebar } from './Sidebar';

export function MainLayout() {
    return (
        <div id="app-layout">
            <Header />
            <div className="layout-body">
                <Sidebar />
                <main id="app-content">
                    <Outlet />
                </main>
            </div>
            <footer id="app-footer">
                <p>Hệ thống quản lý nhân sự © 2026</p>
            </footer>
        </div>
    );
}
