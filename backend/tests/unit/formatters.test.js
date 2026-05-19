/**
 * Unit Tests: formatters.js
 *
 * Kiểm tra hàm toCamelCase:
 * - Chuyển đổi string snake_case sang camelCase
 * - Chuyển đổi object keys từ snake_case sang camelCase
 * - Chuyển đổi mảng objects
 * - Xử lý nested objects
 * - Xử lý các trường hợp đặc biệt (null, Date, số, string thường)
 */
const { toCamelCase } = require('../../utils/formatters');

describe('Formatters - toCamelCase', () => {

    // =====================================================
    // Chuyển đổi object keys
    // =====================================================
    describe('chuyển đổi object keys từ snake_case sang camelCase', () => {
        test('chuyển đổi object đơn giản', () => {
            const input = {
                full_name: 'Nguyen Van A',
                personal_email: 'a@test.com',
                department_id: 2,
            };

            const result = toCamelCase(input);

            expect(result).toEqual({
                fullName: 'Nguyen Van A',
                personalEmail: 'a@test.com',
                departmentId: 2,
            });
        });

        test('chuyển đổi object với nhiều underscore liên tiếp', () => {
            const input = { emergency_contact_name: 'Tran Thi B', emergency_contact_phone: '0123' };

            const result = toCamelCase(input);

            expect(result.emergencyContactName).toBe('Tran Thi B');
            expect(result.emergencyContactPhone).toBe('0123');
        });

        test('giữ nguyên keys đã là camelCase', () => {
            const input = { fullName: 'Nguyen Van A', departmentId: 2 };

            const result = toCamelCase(input);

            expect(result).toEqual({ fullName: 'Nguyen Van A', departmentId: 2 });
        });
    });

    // =====================================================
    // Chuyển đổi mảng
    // =====================================================
    describe('chuyển đổi mảng objects', () => {
        test('chuyển đổi mảng objects', () => {
            const input = [
                { full_name: 'Nguyen Van A', role_id: 1 },
                { full_name: 'Tran Thi B', role_id: 2 },
            ];

            const result = toCamelCase(input);

            expect(result).toEqual([
                { fullName: 'Nguyen Van A', roleId: 1 },
                { fullName: 'Tran Thi B', roleId: 2 },
            ]);
        });

        test('trả về mảng rỗng nếu input là mảng rỗng', () => {
            expect(toCamelCase([])).toEqual([]);
        });
    });

    // =====================================================
    // Chuyển đổi nested objects
    // =====================================================
    describe('xử lý nested objects', () => {
        test('chuyển đổi đệ quy các object lồng nhau', () => {
            const input = {
                employee_id: 5,
                job_title: {
                    job_title_name: 'Software Engineer',
                    department_id: 2,
                },
            };

            const result = toCamelCase(input);

            expect(result.employeeId).toBe(5);
            expect(result.jobTitle.jobTitleName).toBe('Software Engineer');
            expect(result.jobTitle.departmentId).toBe(2);
        });
    });

    // =====================================================
    // Các trường hợp đặc biệt
    // =====================================================
    describe('xử lý các trường hợp đặc biệt', () => {
        test('trả về null nếu input là null', () => {
            expect(toCamelCase(null)).toBeNull();
        });

        test('trả về số nguyên không thay đổi', () => {
            expect(toCamelCase(42)).toBe(42);
        });

        test('trả về string không thay đổi', () => {
            expect(toCamelCase('some_string')).toBe('some_string');
        });

        test('không thay đổi Date object', () => {
            const date = new Date('2025-05-01');
            const result = toCamelCase(date);
            expect(result).toEqual(date);
        });

        test('xử lý object có giá trị null ở các fields', () => {
            const input = { full_name: null, department_id: null };

            const result = toCamelCase(input);

            expect(result).toEqual({ fullName: null, departmentId: null });
        });

        test('xử lý array lồng trong object', () => {
            const input = {
                employee_id: 5,
                degree_list: [
                    { school_name: 'HUST', graduation_year: 2020 },
                ],
            };

            const result = toCamelCase(input);

            expect(result.employeeId).toBe(5);
            expect(result.degreeList[0].schoolName).toBe('HUST');
            expect(result.degreeList[0].graduationYear).toBe(2020);
        });
    });
});
