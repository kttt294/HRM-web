/**
 * Unit Tests: auditLogController.js
 *
 * Kiểm tra các chức năng:
 * - getAuditLogs: Lấy danh sách audit logs với phân trang và các bộ lọc
 * - getAuditLogStats: Lấy thống kê tổng quan
 * - getAuditLogById: Lấy chi tiết một bản ghi log
 */
const auditLogController = require('../../controllers/auditLogController');
const db = require('../../config/database');

jest.mock('../../config/database', () => ({
    query: jest.fn(),
}));

describe('Audit Log Controller', () => {
    let req, res, next;

    beforeEach(() => {
        req = {
            params: {},
            query: {},
            user: { id: 1, role: 'admin' },
        };
        res = {
            json: jest.fn(),
            status: jest.fn().mockReturnThis(),
        };
        next = jest.fn();
        jest.clearAllMocks();
    });

    // =====================================================
    // getAuditLogs
    // =====================================================
    describe('getAuditLogs()', () => {
        test('lấy danh sách audit logs với phân trang mặc định', async () => {
            const mockLogs = [
                { id: 1, action: 'LOGIN', username: 'admin', status_code: 200 },
                { id: 2, action: 'UPDATE_EMPLOYEE', username: 'hruser', status_code: 200 },
            ];

            db.query
                .mockResolvedValueOnce([[{ total: 2 }]])   // COUNT query
                .mockResolvedValueOnce([mockLogs]);         // DATA query

            await auditLogController.getAuditLogs(req, res, next);

            expect(res.json).toHaveBeenCalledWith({
                data: mockLogs,
                pagination: expect.objectContaining({
                    page: 1,
                    limit: 20,
                    total: 2,
                    totalPages: 1,
                }),
            });
        });

        test('lọc theo userId và action', async () => {
            req.query = { userId: '2', action: 'LOGIN' };

            db.query
                .mockResolvedValueOnce([[{ total: 5 }]])
                .mockResolvedValueOnce([[{ id: 1 }]]);

            await auditLogController.getAuditLogs(req, res, next);

            // Kiểm tra câu query COUNT có chứa điều kiện filter
            const countCall = db.query.mock.calls[0];
            expect(countCall[0]).toContain('al.user_id = ?');
            expect(countCall[0]).toContain('al.action LIKE ?');
            expect(countCall[1]).toEqual(expect.arrayContaining([2, '%LOGIN%']));
        });

        test('lọc theo nhóm status code 4xx', async () => {
            req.query = { statusCode: '4xx' };

            db.query
                .mockResolvedValueOnce([[{ total: 10 }]])
                .mockResolvedValueOnce([[{ id: 1 }]]);

            await auditLogController.getAuditLogs(req, res, next);

            const countCall = db.query.mock.calls[0];
            expect(countCall[0]).toContain('al.status_code >= 400 AND al.status_code < 500');
        });

        test('lọc theo nhóm status code 5xx', async () => {
            req.query = { statusCode: '5xx' };

            db.query
                .mockResolvedValueOnce([[{ total: 3 }]])
                .mockResolvedValueOnce([[{ id: 1 }]]);

            await auditLogController.getAuditLogs(req, res, next);

            const countCall = db.query.mock.calls[0];
            expect(countCall[0]).toContain('al.status_code >= 500');
        });

        test('lọc theo startDate và endDate', async () => {
            req.query = { startDate: '2025-05-01', endDate: '2025-05-31' };

            db.query
                .mockResolvedValueOnce([[{ total: 20 }]])
                .mockResolvedValueOnce([[{ id: 1 }]]);

            await auditLogController.getAuditLogs(req, res, next);

            const countCall = db.query.mock.calls[0];
            expect(countCall[0]).toContain('al.created_at >=');
            expect(countCall[0]).toContain('al.created_at <=');
            expect(countCall[1]).toEqual(expect.arrayContaining(['2025-05-01', '2025-05-31 23:59:59']));
        });

        test('lọc theo method HTTP', async () => {
            req.query = { method: 'patch' };

            db.query
                .mockResolvedValueOnce([[{ total: 8 }]])
                .mockResolvedValueOnce([[{ id: 1 }]]);

            await auditLogController.getAuditLogs(req, res, next);

            const countCall = db.query.mock.calls[0];
            expect(countCall[1]).toEqual(expect.arrayContaining(['PATCH'])); // Phải uppercase
        });

        test('phân trang đúng theo page và limit', async () => {
            req.query = { page: '3', limit: '10' };

            db.query
                .mockResolvedValueOnce([[{ total: 50 }]])
                .mockResolvedValueOnce([[{ id: 21 }]]);

            await auditLogController.getAuditLogs(req, res, next);

            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    pagination: expect.objectContaining({
                        page: 3,
                        limit: 10,
                        total: 50,
                        totalPages: 5,
                    }),
                })
            );

            // Kiểm tra OFFSET = (3-1) * 10 = 20
            const dataCall = db.query.mock.calls[1];
            expect(dataCall[1]).toEqual(expect.arrayContaining([10, 20])); // LIMIT 10 OFFSET 20
        });

        test('gọi next(error) nếu DB lỗi', async () => {
            const err = new Error('DB error');
            db.query.mockRejectedValueOnce(err);
            await auditLogController.getAuditLogs(req, res, next);
            expect(next).toHaveBeenCalledWith(err);
        });
    });

    // =====================================================
    // getAuditLogStats
    // =====================================================
    describe('getAuditLogStats()', () => {
        test('lấy thống kê tổng quan audit logs', async () => {
            db.query
                .mockResolvedValueOnce([[{ total: 500 }]])  // Tổng số log
                .mockResolvedValueOnce([[{ total: 42 }]])   // Log hôm nay
                .mockResolvedValueOnce([[{ total: 15 }]])   // Lỗi 4xx
                .mockResolvedValueOnce([[{ total: 2 }]])    // Lỗi 5xx
                .mockResolvedValueOnce([[                   // Top actions
                    { action: 'LOGIN', count: 200 },
                    { action: 'UPDATE_EMPLOYEE', count: 50 },
                ]]);

            await auditLogController.getAuditLogStats(req, res, next);

            expect(res.json).toHaveBeenCalledWith({
                total: 500,
                today: 42,
                clientErrors: 15,
                serverErrors: 2,
                topActions: [
                    { action: 'LOGIN', count: 200 },
                    { action: 'UPDATE_EMPLOYEE', count: 50 },
                ],
            });
        });

        test('gọi next(error) nếu DB lỗi', async () => {
            const err = new Error('DB error');
            db.query.mockRejectedValueOnce(err);
            await auditLogController.getAuditLogStats(req, res, next);
            expect(next).toHaveBeenCalledWith(err);
        });
    });

    // =====================================================
    // getAuditLogById
    // =====================================================
    describe('getAuditLogById()', () => {
        test('lấy chi tiết bản ghi log theo ID', async () => {
            req.params.id = '1';
            const mockLog = {
                id: 1, action: 'UPDATE_EMPLOYEE', username: 'hruser',
                status_code: 200, department_name: 'IT Dept',
            };
            db.query.mockResolvedValueOnce([[mockLog]]);

            await auditLogController.getAuditLogById(req, res, next);

            expect(db.query).toHaveBeenCalledWith(
                expect.stringContaining('WHERE al.id = ?'),
                ['1']
            );
            expect(res.json).toHaveBeenCalledWith(mockLog);
        });

        test('trả về 404 nếu không tìm thấy bản ghi log', async () => {
            req.params.id = '9999';
            db.query.mockResolvedValueOnce([[]]); // Không tìm thấy

            await auditLogController.getAuditLogById(req, res, next);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ message: 'Không tìm thấy bản ghi log' });
        });

        test('gọi next(error) nếu DB lỗi', async () => {
            req.params.id = '1';
            const err = new Error('DB error');
            db.query.mockRejectedValueOnce(err);
            await auditLogController.getAuditLogById(req, res, next);
            expect(next).toHaveBeenCalledWith(err);
        });
    });
});
