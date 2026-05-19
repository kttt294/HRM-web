const departmentController = require('../../controllers/departmentController');
const db = require('../../config/database');

// Mock database
jest.mock('../../config/database', () => ({
    query: jest.fn()
}));

// Mock formatters (toCamelCase) để test không phụ thuộc vào utility
jest.mock('../../utils/formatters', () => ({
    toCamelCase: jest.fn((data) => data) // Pass-through: trả về dữ liệu gốc
}));

describe('Department Controller', () => {
    let req, res, next;

    beforeEach(() => {
        req = { params: {}, body: {} };
        res = {
            json: jest.fn(),
            status: jest.fn().mockReturnThis()
        };
        next = jest.fn();
        jest.clearAllMocks();
    });

    // =====================================================
    // GET ALL - getAll
    // =====================================================
    describe('getAll()', () => {
        test('trả về danh sách tất cả phòng ban', async () => {
            const mockDepartments = [
                { id: 1, name: 'Ban Giám Đốc', location: 'Tầng 5', manager_name: 'Nguyễn Quản Trị' },
                { id: 2, name: 'Phòng Công nghệ', location: 'Tầng 4', manager_name: 'Vũ Văn Cứng' }
            ];
            db.query.mockResolvedValueOnce([mockDepartments]);

            await departmentController.getAll(req, res, next);

            expect(db.query).toHaveBeenCalledWith(expect.stringContaining('FROM departments'));
            expect(res.json).toHaveBeenCalledWith(mockDepartments);
            expect(next).not.toHaveBeenCalled();
        });

        test('trả về mảng rỗng nếu không có phòng ban', async () => {
            db.query.mockResolvedValueOnce([[]]);

            await departmentController.getAll(req, res, next);

            expect(res.json).toHaveBeenCalledWith([]);
        });

        test('gọi next(error) nếu truy vấn DB thất bại', async () => {
            const dbError = new Error('DB connection error');
            db.query.mockRejectedValueOnce(dbError);

            await departmentController.getAll(req, res, next);

            expect(next).toHaveBeenCalledWith(dbError);
        });
    });

    // =====================================================
    // GET BY ID - getById
    // =====================================================
    describe('getById()', () => {
        test('trả về phòng ban theo ID nếu tồn tại', async () => {
            req.params.id = '1';
            const mockDept = { id: 1, name: 'Ban Giám Đốc', location: 'Tầng 5' };
            db.query.mockResolvedValueOnce([[mockDept]]);

            await departmentController.getById(req, res, next);

            expect(db.query).toHaveBeenCalledWith(expect.stringContaining('WHERE id = ?'), ['1']);
            expect(res.json).toHaveBeenCalledWith(mockDept);
        });

        test('trả về 404 nếu phòng ban không tồn tại', async () => {
            req.params.id = '999';
            db.query.mockResolvedValueOnce([[]]); // Không tìm thấy

            await departmentController.getById(req, res, next);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ message: 'Không tìm thấy phòng ban' });
        });
    });

    // =====================================================
    // CREATE - create
    // =====================================================
    describe('create()', () => {
        test('tạo phòng ban mới thành công', async () => {
            req.body = { name: 'Phòng Marketing', description: 'Phòng quảng cáo', location: 'Tầng 3' };
            const newDept = { id: 5, name: 'Phòng Marketing', description: 'Phòng quảng cáo' };

            db.query
                .mockResolvedValueOnce([{ insertId: 5 }])  // INSERT
                .mockResolvedValueOnce([[newDept]]);         // SELECT sau INSERT

            await departmentController.create(req, res, next);

            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith(newDept);
        });

        test('trả về 400 nếu thiếu tên phòng ban', async () => {
            req.body = { description: 'Phòng không tên' };

            await departmentController.create(req, res, next);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: 'Tên phòng ban là bắt buộc' });
            expect(db.query).not.toHaveBeenCalled();
        });

        test('trả về 400 nếu tên phòng ban đã tồn tại (duplicate)', async () => {
            req.body = { name: 'Ban Giám Đốc' };
            const dupError = new Error('Duplicate entry');
            dupError.code = 'ER_DUP_ENTRY';
            db.query.mockRejectedValueOnce(dupError);

            await departmentController.create(req, res, next);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: 'Tên phòng ban đã tồn tại' });
        });

        test('tạo phòng ban và tự động nâng role manager nếu managerId được cung cấp', async () => {
            req.body = { name: 'Phòng Mới', managerId: 5 };
            const newDept = { id: 6, name: 'Phòng Mới', manager_id: 5 };

            db.query
                .mockResolvedValueOnce([{ insertId: 6 }])   // INSERT department
                .mockResolvedValueOnce([[newDept]])           // SELECT new department
                .mockResolvedValueOnce([{ affectedRows: 1 }]); // UPDATE user role

            await departmentController.create(req, res, next);

            expect(res.status).toHaveBeenCalledWith(201);
            // Phải có query cập nhật role manager
            expect(db.query).toHaveBeenCalledTimes(3);
        });
    });

    // =====================================================
    // UPDATE - update
    // =====================================================
    describe('update()', () => {
        test('cập nhật phòng ban thành công', async () => {
            req.params.id = '2';
            req.body = { name: 'Phòng Kỹ Thuật', location: 'Tầng 4 - Khu A' };
            const updatedDept = { id: 2, name: 'Phòng Kỹ Thuật', location: 'Tầng 4 - Khu A' };

            db.query
                .mockResolvedValueOnce([{ affectedRows: 1 }]) // UPDATE
                .mockResolvedValueOnce([[updatedDept]]);        // SELECT sau UPDATE

            await departmentController.update(req, res, next);

            expect(res.json).toHaveBeenCalledWith(updatedDept);
        });

        test('trả về 400 nếu không có trường nào để cập nhật', async () => {
            req.params.id = '2';
            req.body = { unknownField: 'value' }; // Field không hợp lệ

            await departmentController.update(req, res, next);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: 'Không có trường nào để cập nhật' });
        });

        test('trả về 404 nếu không tìm thấy phòng ban sau khi cập nhật', async () => {
            req.params.id = '999';
            req.body = { name: 'Phòng Không Tồn Tại' };

            db.query
                .mockResolvedValueOnce([{ affectedRows: 0 }]) // UPDATE không ảnh hưởng
                .mockResolvedValueOnce([[]]); // SELECT trả về rỗng

            await departmentController.update(req, res, next);

            expect(res.status).toHaveBeenCalledWith(404);
        });
    });

    // =====================================================
    // DELETE - delete
    // =====================================================
    describe('delete()', () => {
        test('xóa phòng ban thành công nếu không có nhân viên', async () => {
            req.params.id = '3';

            db.query
                .mockResolvedValueOnce([[{ count: 0 }]])      // COUNT employees = 0
                .mockResolvedValueOnce([{ affectedRows: 1 }]); // DELETE

            await departmentController.delete(req, res, next);

            expect(res.json).toHaveBeenCalledWith({ message: 'Xóa phòng ban thành công' });
        });

        test('trả về 400 nếu phòng ban đang có nhân viên', async () => {
            req.params.id = '2';

            db.query.mockResolvedValueOnce([[{ count: 5 }]]); // 5 nhân viên

            await departmentController.delete(req, res, next);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: 'Không thể xóa phòng ban đang có nhân viên' });
        });

        test('trả về 404 nếu phòng ban không tồn tại khi xóa', async () => {
            req.params.id = '999';

            db.query
                .mockResolvedValueOnce([[{ count: 0 }]])      // COUNT = 0
                .mockResolvedValueOnce([{ affectedRows: 0 }]); // DELETE không ảnh hưởng

            await departmentController.delete(req, res, next);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ message: 'Không tìm thấy phòng ban' });
        });
    });
});
