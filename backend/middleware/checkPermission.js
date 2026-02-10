const { hasPermission } = require('../utils/permissions');

/**
 * Middleware kiểm tra permission
 * Sử dụng: router.post('/employees', authMiddleware, requirePermission('manage_employees'), ...)
 */
const requirePermission = (permissionName) => {
    return async (req, res, next) => {
        try {
            // authMiddleware đã set req.user
            if (!req.user || !req.user.id) {
                return res.status(401).json({ 
                    message: 'Chưa xác thực' 
                });
            }

            const userHasPermission = await hasPermission(req.user.id, permissionName);

            if (!userHasPermission) {
                return res.status(403).json({ 
                    message: 'Bạn không có quyền thực hiện hành động này',
                    required_permission: permissionName
                });
            }

            next();
        } catch (error) {
            next(error);
        }
    };
};

/**
 * Middleware kiểm tra nhiều permissions (OR logic)
 * User chỉ cần có 1 trong các permissions
 */
const requireAnyPermission = (permissionNames) => {
    return async (req, res, next) => {
        try {
            if (!req.user || !req.user.id) {
                return res.status(401).json({ 
                    message: 'Chưa xác thực' 
                });
            }

            for (const permissionName of permissionNames) {
                const userHasPermission = await hasPermission(req.user.id, permissionName);
                if (userHasPermission) {
                    return next();
                }
            }

            return res.status(403).json({ 
                message: 'Bạn không có quyền thực hiện hành động này',
                required_permissions: permissionNames
            });
        } catch (error) {
            next(error);
        }
    };
};

module.exports = {
    requirePermission,
    requireAnyPermission
};
