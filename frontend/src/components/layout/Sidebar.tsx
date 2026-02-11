import { NavLink } from 'react-router-dom';
import { useRef, useEffect } from 'react';
import { ROUTES } from '../../shared/constants/routes';
import { useUIStore } from '../../store/ui.store';
import { usePermissions, ShowForRoles } from '../guards/PermissionGuard';
import { Role } from '../../shared/constants/rbac';
import anime from 'animejs';

/**
 * ============================================
 * SIDEBAR WITH ROLE-BASED MENU + ANIMATIONS
 * ============================================
 */
export function Sidebar() {
    const { sidebarCollapsed } = useUIStore();
    const { isAdmin, isHR, isEmployee } = usePermissions();
    const sidebarRef = useRef<HTMLElement>(null);

    // Entry animation
    useEffect(() => {
        if (sidebarRef.current) {
            anime({
                targets: sidebarRef.current.querySelectorAll('.menu-section'),
                opacity: [0, 1],
                translateX: [-20, 0],
                duration: 400,
                delay: anime.stagger(60),
                easing: 'easeOutQuart',
            });
        }
    }, []);

    return (
        <aside 
            ref={sidebarRef}
            id="app-sidebar" 
            className={sidebarCollapsed ? 'collapsed' : ''}
        >
            <nav className="main-menu">
                <ul>
                    {/* ============================
                        ADMIN MENU - Quản lý hệ thống
                    ============================ */}
                    <ShowForRoles roles={[Role.ADMIN]}>
                        <li className="menu-section" style={{ opacity: 0 }}>
                            <NavLink to="/admin/users">
                                <span className="menu-indicator" style={{ background: '#1976d2' }} />
                                <span className="menu-text">Bảng điều khiển</span>
                            </NavLink>
                        </li>

                        <li className="menu-section" style={{ opacity: 0 }}>
                            <span className="menu-section-title">
                                <span className="menu-indicator" style={{ background: '#f44336' }} />
                                <span className="menu-text">Quản lý hệ thống</span>
                            </span>
                            <ul className="submenu">
                                <li>
                                    <NavLink to="/admin/users">
                                        <span className="menu-text">Tài khoản người dùng</span>
                                    </NavLink>
                                </li>
                                <li>
                                    <NavLink to="/admin/users/new">
                                        <span className="menu-text">Tạo tài khoản mới</span>
                                    </NavLink>
                                </li>
                                <li>
                                    <NavLink to={ROUTES.ADMIN_EMPLOYEES}>
                                        <span className="menu-text">Danh sách nhân viên</span>
                                    </NavLink>
                                </li>
                            </ul>
                        </li>
                    </ShowForRoles>

                    {/* ============================
                        HR MENU - Quản lý nhân sự
                    ============================ */}
                    <ShowForRoles roles={[Role.HR]}>
                        <li className="menu-section" style={{ opacity: 0 }}>
                            <NavLink to={ROUTES.HOME}>
                                <span className="menu-indicator" style={{ background: '#1976d2' }} />
                                <span className="menu-text">Bảng điều khiển</span>
                            </NavLink>
                        </li>

                        <li className="menu-section" style={{ opacity: 0 }}>
                            <span className="menu-section-title">
                                <span className="menu-indicator" style={{ background: '#4caf50' }} />
                                <span className="menu-text">Quản lý nhân sự</span>
                            </span>
                            <ul className="submenu">
                                <li>
                                    <NavLink to={ROUTES.EMPLOYEES}>
                                        <span className="menu-text">Danh sách nhân viên</span>
                                    </NavLink>
                                </li>
                                <li>
                                    <NavLink to={ROUTES.EMPLOYEE_NEW}>
                                        <span className="menu-text">Thêm nhân viên</span>
                                    </NavLink>
                                </li>
                                <li>
                                    <NavLink to={ROUTES.DEPARTMENTS}>
                                        <span className="menu-text">Phòng ban</span>
                                    </NavLink>
                                </li>
                            </ul>
                        </li>

                        <li className="menu-section" style={{ opacity: 0 }}>
                            <span className="menu-section-title">
                                <span className="menu-indicator" style={{ background: '#ff9800' }} />
                                <span className="menu-text">Tuyển dụng</span>
                            </span>
                            <ul className="submenu">
                                <li>
                                    <NavLink to={ROUTES.RECRUITMENT}>
                                        <span className="menu-text">Tổng quan</span>
                                    </NavLink>
                                </li>
                                <li>
                                    <NavLink to={ROUTES.VACANCIES}>
                                        <span className="menu-text">Vị trí tuyển dụng</span>
                                    </NavLink>
                                </li>
                                <li>
                                    <NavLink to={ROUTES.CANDIDATES}>
                                        <span className="menu-text">Ứng viên</span>
                                    </NavLink>
                                </li>
                            </ul>
                        </li>

                        <li className="menu-section" style={{ opacity: 0 }}>
                            <span className="menu-section-title">
                                <span className="menu-indicator" style={{ background: '#00bcd4' }} />
                                <span className="menu-text">Nghỉ phép & Lương</span>
                            </span>
                            <ul className="submenu">
                                <li>
                                    <NavLink to={ROUTES.LEAVE_MANAGEMENT}>
                                        <span className="menu-text">Quản lý nghỉ phép</span>
                                    </NavLink>
                                </li>
                                <li>
                                    <NavLink to={ROUTES.PAYROLL_LIST}>
                                        <span className="menu-text">Bảng lương</span>
                                    </NavLink>
                                </li>
                            </ul>
                        </li>
                    </ShowForRoles>

                    {/* ============================
                        EMPLOYEE MENU - Cá nhân
                    ============================ */}
                    <ShowForRoles roles={[Role.HR, Role.EMPLOYEE]}>
                        <li className="menu-section" style={{ opacity: 0 }}>
                            <span className="menu-section-title">
                                <span className="menu-indicator" style={{ background: '#9c27b0' }} />
                                <span className="menu-text">Cá nhân</span>
                            </span>
                            <ul className="submenu">
                                <li>
                                    <NavLink to={ROUTES.MY_PROFILE}>
                                        <span className="menu-text">Thông tin của tôi</span>
                                    </NavLink>
                                </li>
                                <li>
                                    <NavLink to={ROUTES.MY_LEAVES}>
                                        <span className="menu-text">Yêu cầu nghỉ phép</span>
                                    </NavLink>
                                </li>
                                <li>
                                    <NavLink to={ROUTES.MY_PAYROLL}>
                                        <span className="menu-text">Bảng lương của tôi</span>
                                    </NavLink>
                                </li>
                            </ul>
                        </li>
                    </ShowForRoles>


                </ul>
            </nav>

            {/* Role indicator */}
            <div style={{
                position: 'absolute',
                bottom: '16px',
                left: '16px',
                right: '16px',
                padding: '10px 12px',
                background: 'linear-gradient(135deg, #f5f5f5 0%, #eeeeee 100%)',
                borderRadius: '8px',
                fontSize: '11px',
                color: '#757575',
                textAlign: 'center',
                fontWeight: '500',
            }}>
                {isAdmin && 'System Admin'}
                {isHR && 'HR Manager'}
                {isEmployee && 'Nhân viên'}
            </div>
        </aside>
    );
}

