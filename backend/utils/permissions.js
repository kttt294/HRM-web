const db = require('../config/database');

/**
 * Lấy tất cả permissions của một user dựa trên role_id
 */
async function getUserPermissions(userId) {
    const [permissions] = await db.query(`
        SELECT DISTINCT p.name
        FROM users u
        JOIN role_permissions rp ON u.role_id = rp.role_id
        JOIN permissions p ON rp.permission_id = p.id
        WHERE u.id = ?
    `, [userId]);
    
    return permissions.map(p => p.name);
}

/**
 * Lấy permissions của một role
 */
async function getRolePermissions(roleId) {
    const [permissions] = await db.query(`
        SELECT p.name
        FROM role_permissions rp
        JOIN permissions p ON rp.permission_id = p.id
        WHERE rp.role_id = ?
    `, [roleId]);
    
    return permissions.map(p => p.name);
}

/**
 * Kiểm tra user có permission không
 */
async function hasPermission(userId, permissionName) {
    const [result] = await db.query(`
        SELECT COUNT(*) as count
        FROM users u
        JOIN role_permissions rp ON u.role_id = rp.role_id
        JOIN permissions p ON rp.permission_id = p.id
        WHERE u.id = ? AND p.name = ?
    `, [userId, permissionName]);
    
    return result[0].count > 0;
}

module.exports = {
    getUserPermissions,
    getRolePermissions,
    hasPermission
};
