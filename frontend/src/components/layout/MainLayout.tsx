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
                <p>[Nhóm 8] BTL Kỹ thuật phần mềm - kỳ 2 - năm 2026 - ĐH Phenikaa</p>
            </footer>
        </div>
    );
}
