/**
 * Unit Tests: Frontend Shared Utilities
 *
 * Kiểm tra các hàm tiện ích dùng chung:
 *
 * date.util.ts:
 * - formatDate: Format ngày theo locale Việt Nam
 * - formatDateTime: Format ngày giờ theo locale Việt Nam
 * - getRelativeTime: Hiển thị thời gian tương đối
 * - calculateAge: Tính tuổi từ ngày sinh
 *
 * format.util.ts:
 * - formatCurrency: Format tiền tệ VND
 * - formatNumber: Format số có dấu phân cách nghìn
 * - formatPhone: Format số điện thoại
 * - truncate: Cắt ngắn văn bản với ellipsis
 * - capitalize: Viết hoa chữ cái đầu mỗi từ
 * - formatEmployeeId: Format mã nhân viên 5 chữ số
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { formatDate, formatDateTime, getRelativeTime, calculateAge } from '../../shared/utils/date.util';
import { formatCurrency, formatNumber, formatPhone, truncate, capitalize, formatEmployeeId } from '../../shared/utils/format.util';

describe('date.util', () => {

    // =====================================================
    // formatDate
    // =====================================================
    describe('formatDate()', () => {
        it('trả về "—" nếu giá trị null hoặc undefined', () => {
            expect(formatDate(null)).toBe('—');
            expect(formatDate(undefined)).toBe('—');
        });

        it('trả về "—" nếu chuỗi ngày không hợp lệ', () => {
            expect(formatDate('invalid-date')).toBe('—');
        });

        it('format chuỗi ngày ISO hợp lệ sang locale Việt Nam', () => {
            const result = formatDate('2025-05-20');
            // Kiểm tra kết quả là chuỗi có định dạng ngày (chứa '20' và '05' và '2025')
            expect(result).toMatch(/20/);
            expect(result).toMatch(/5/);
            expect(result).toMatch(/2025/);
        });

        it('chấp nhận đối tượng Date', () => {
            const date = new Date('2025-06-15');
            const result = formatDate(date);
            expect(result).toMatch(/2025/);
            expect(result).not.toBe('—');
        });
    });

    // =====================================================
    // formatDateTime
    // =====================================================
    describe('formatDateTime()', () => {
        it('trả về "—" nếu giá trị null hoặc undefined', () => {
            expect(formatDateTime(null)).toBe('—');
            expect(formatDateTime(undefined)).toBe('—');
        });

        it('trả về "—" nếu chuỗi ngày giờ không hợp lệ', () => {
            expect(formatDateTime('not-a-date')).toBe('—');
        });

        it('format chuỗi ISO thành chuỗi ngày giờ hợp lệ', () => {
            const result = formatDateTime('2025-05-20T10:30:00');
            expect(result).toMatch(/2025/);
            expect(result).not.toBe('—');
        });
    });

    // =====================================================
    // getRelativeTime
    // =====================================================
    describe('getRelativeTime()', () => {
        it('trả về "—" nếu giá trị null hoặc undefined', () => {
            expect(getRelativeTime(null)).toBe('—');
            expect(getRelativeTime(undefined)).toBe('—');
        });

        it('trả về "Hôm nay" nếu date là hôm nay', () => {
            const today = new Date();
            expect(getRelativeTime(today)).toBe('Hôm nay');
        });

        it('trả về "Hôm qua" nếu date là ngày hôm qua', () => {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            expect(getRelativeTime(yesterday)).toBe('Hôm qua');
        });

        it('trả về số ngày trước nếu < 7 ngày', () => {
            const threeDaysAgo = new Date();
            threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
            expect(getRelativeTime(threeDaysAgo)).toBe('3 ngày trước');
        });

        it('trả về số tuần trước nếu < 30 ngày', () => {
            const twoWeeksAgo = new Date();
            twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
            expect(getRelativeTime(twoWeeksAgo)).toBe('2 tuần trước');
        });

        it('trả về số tháng trước nếu < 365 ngày', () => {
            const twoMonthsAgo = new Date();
            twoMonthsAgo.setDate(twoMonthsAgo.getDate() - 60);
            expect(getRelativeTime(twoMonthsAgo)).toBe('2 tháng trước');
        });

        it('trả về số năm trước nếu >= 365 ngày', () => {
            const twoYearsAgo = new Date();
            twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);
            expect(getRelativeTime(twoYearsAgo)).toBe('2 năm trước');
        });
    });

    // =====================================================
    // calculateAge
    // =====================================================
    describe('calculateAge()', () => {
        it('trả về 0 nếu đầu vào là null hoặc undefined', () => {
            expect(calculateAge(null)).toBe(0);
            expect(calculateAge(undefined)).toBe(0);
        });

        it('trả về 0 nếu ngày sinh không hợp lệ', () => {
            expect(calculateAge('invalid')).toBe(0);
        });

        it('tính đúng tuổi từ ngày sinh', () => {
            const currentYear = new Date().getFullYear();
            const dob = `${currentYear - 25}-01-01`; // Sinh 25 năm trước
            const age = calculateAge(dob);
            // Có thể là 24 hoặc 25 tùy ngày hiện tại
            expect(age).toBeGreaterThanOrEqual(24);
            expect(age).toBeLessThanOrEqual(25);
        });

        it('chấp nhận đối tượng Date', () => {
            const dob = new Date();
            dob.setFullYear(dob.getFullYear() - 30);
            const age = calculateAge(dob);
            expect(age).toBeGreaterThanOrEqual(29);
            expect(age).toBeLessThanOrEqual(30);
        });
    });
});

// =============================================================

describe('format.util', () => {

    // =====================================================
    // formatCurrency
    // =====================================================
    describe('formatCurrency()', () => {
        it('trả về "-" nếu đầu vào là undefined hoặc null', () => {
            expect(formatCurrency(undefined)).toBe('-');
            expect(formatCurrency(null as any)).toBe('-');
        });

        it('format số 0 thành tiền tệ VND', () => {
            const result = formatCurrency(0);
            expect(result).toContain('0');
            expect(result).toContain('₫');
        });

        it('format số dương thành tiền tệ VND đúng định dạng', () => {
            const result = formatCurrency(10000000);
            // Kết quả phải chứa ký hiệu ₫ và số 10
            expect(result).toContain('₫');
            expect(result).toMatch(/10/);
        });
    });

    // =====================================================
    // formatNumber
    // =====================================================
    describe('formatNumber()', () => {
        it('format số với dấu phân cách nghìn Việt Nam', () => {
            const result = formatNumber(1000000);
            // Locale Việt Nam dùng dấu chấm hoặc dấu phẩy cho phân cách nghìn
            expect(result).toMatch(/1[.,\s]000[.,\s]000/);
        });

        it('format số 0', () => {
            expect(formatNumber(0)).toBe('0');
        });
    });

    // =====================================================
    // formatPhone
    // =====================================================
    describe('formatPhone()', () => {
        it('trả về "-" nếu số điện thoại rỗng hoặc không có', () => {
            expect(formatPhone('')).toBe('-');
        });

        it('format số điện thoại 10 chữ số thành định dạng xxx xxx xxxx', () => {
            const result = formatPhone('0912345678');
            expect(result).toBe('0912 345 678');
        });

        it('giữ nguyên số điện thoại không có đúng 10 chữ số', () => {
            const result = formatPhone('1234');
            expect(result).toBe('1234');
        });

        it('xóa ký tự không phải số trước khi format', () => {
            const result = formatPhone('091-234-5678');
            expect(result).toBe('0912 345 678');
        });
    });

    // =====================================================
    // truncate
    // =====================================================
    describe('truncate()', () => {
        it('không thay đổi nếu text ngắn hơn hoặc bằng maxLength', () => {
            expect(truncate('Ngắn', 10)).toBe('Ngắn');
            expect(truncate('Vừa đủ dài', 10)).toBe('Vừa đủ dài');
        });

        it('cắt ngắn và thêm "..." nếu text dài hơn maxLength', () => {
            const result = truncate('Văn bản rất dài cần được cắt ngắn lại', 15);
            expect(result.length).toBe(15);
            expect(result.endsWith('...')).toBe(true);
        });
    });

    // =====================================================
    // capitalize
    // =====================================================
    describe('capitalize()', () => {
        it('viết hoa chữ cái đầu mỗi từ', () => {
            expect(capitalize('nguyen van a')).toBe('Nguyen Van A');
        });

        it('chuyển phần còn lại thành chữ thường', () => {
            expect(capitalize('NGUYEN VAN A')).toBe('Nguyen Van A');
        });

        it('xử lý chuỗi một từ', () => {
            expect(capitalize('admin')).toBe('Admin');
        });
    });

    // =====================================================
    // formatEmployeeId
    // =====================================================
    describe('formatEmployeeId()', () => {
        it('trả về "-" nếu đầu vào là undefined hoặc null', () => {
            expect(formatEmployeeId(undefined)).toBe('-');
            expect(formatEmployeeId(null)).toBe('-');
        });

        it('pad số đầu để thành 5 chữ số', () => {
            expect(formatEmployeeId(1)).toBe('00001');
            expect(formatEmployeeId(42)).toBe('00042');
            expect(formatEmployeeId(12345)).toBe('12345');
        });

        it('chấp nhận đầu vào là string', () => {
            expect(formatEmployeeId('7')).toBe('00007');
        });

        it('không thay đổi nếu đã >= 5 chữ số', () => {
            expect(formatEmployeeId(123456)).toBe('123456');
        });
    });
});
