/**
 * Middleware xử lý lọc dữ liệu (Data Scoping) dựa trên quyền hạn
 * Đảm bảo nhân viên thường chỉ thấy dữ liệu họ được gán
 */
const dataScope = (resourceType) => {
    return (req, res, next) => {
        const { role, employeeId } = req.user;

        // Nếu là Admin hoặc HR, không cần Scoping (thấy tất cả)
        if (role === 'admin' || role === 'hr') {
            req.queryScope = {}; 
            return next();
        }

        // Với Manager hoặc Employee, áp dụng scope theo từng loại tài nguyên
        switch (resourceType) {
            case 'vacancy':
                // Chỉ thấy tin tuyển dụng mình phụ trách
                req.queryScope = { recruiter_id: employeeId };
                break;
                
            case 'employee':
                // Với Manager: chỉ thấy nhân viên cùng phòng ban
                if (role === 'manager') {
                    // Cần lấy department_id của manager trước (thực hiện ở controller hoặc middleware mở rộng)
                    req.queryScope = { filterByDept: true };
                } else {
                    // Nhân viên thường chỉ thấy chính mình (hoặc có thể chặn hoàn toàn tùy API)
                    req.queryScope = { id: employeeId };
                }
                break;

            case 'leave_request':
                // Manager duyệt cho phòng ban, Employee xem của mình
                if (role === 'manager') {
                    req.queryScope = { filterByDept: true };
                } else {
                    req.queryScope = { employee_id: employeeId };
                }
                break;

            default:
                req.queryScope = {};
        }

        next();
    };
};

module.exports = { dataScope };
