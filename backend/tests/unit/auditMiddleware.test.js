const auditMiddleware = require('../../middleware/auditMiddleware');
const auditService = require('../../utils/auditService');

// Mock auditService
jest.mock('../../utils/auditService', () => ({
  logRequest: jest.fn(),
}));

describe('Audit Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    jest.clearAllMocks();
    
    req = {
      method: 'POST',
      originalUrl: '/api/employees',
      user: {
        id: 'u1',
        employeeId: 'e1',
        username: 'nva',
        name: 'Nguyen Van A',
      },
    };

    // Mock res object with 'on' method for events
    const listeners = {};
    res = {
      statusCode: 201,
      on: jest.fn((event, cb) => {
        listeners[event] = cb;
      }),
      // Helper to trigger events
      emit: function(event) {
        if (listeners[event]) {
          listeners[event]();
        }
      }
    };

    next = jest.fn();
    
    jest.spyOn(Date, 'now').mockReturnValue(1000);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('không ghi log nếu không có req.user', () => {
    req.user = undefined;
    
    auditMiddleware(req, res, next);
    res.emit('finish');

    expect(auditService.logRequest).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalled();
  });

  it('không ghi log nếu endpoint nằm trong EXCLUDED_ENDPOINTS', () => {
    req.originalUrl = '/api/auth/refresh';
    
    auditMiddleware(req, res, next);
    res.emit('finish');

    expect(auditService.logRequest).not.toHaveBeenCalled();
  });

  it('không ghi log nếu method là GET (mặc định) và không bị ép ghi log', () => {
    req.method = 'GET';
    req.originalUrl = '/api/employees/1';
    
    auditMiddleware(req, res, next);
    res.emit('finish');

    expect(auditService.logRequest).not.toHaveBeenCalled();
  });

  it('ghi log thành công cho POST request thông thường', () => {
    jest.spyOn(Date, 'now')
      .mockReturnValueOnce(1000) // start
      .mockReturnValueOnce(1050); // end

    auditMiddleware(req, res, next);
    res.emit('finish');

    expect(auditService.logRequest).toHaveBeenCalledWith({
      req,
      action: 'CREATE_EMPLOYEES',
      resource: 'employees',
      resourceId: null,
      details: null,
      method: 'POST',
      endpoint: '/api/employees',
      statusCode: 201,
      responseTime: 50,
      userId: 'u1',
      employeeId: 'e1',
      username: 'nva',
      fullName: 'Nguyen Van A',
    });
    expect(next).toHaveBeenCalled();
  });

  it('ghi log cho UPDATE với resource ID', () => {
    req.method = 'PUT';
    req.originalUrl = '/api/leave-requests/5';
    res.statusCode = 200;

    auditMiddleware(req, res, next);
    res.emit('finish');

    expect(auditService.logRequest).toHaveBeenCalledWith(expect.objectContaining({
      action: 'UPDATE_LEAVE_REQUESTS',
      resource: 'leave_requests',
      resourceId: '5',
      method: 'PUT',
      statusCode: 200,
    }));
  });

  it('sử dụng action và chi tiết được gán đè (force log)', () => {
    req.method = 'GET';
    req.originalUrl = '/api/reports/salary';
    res.statusCode = 200;
    
    // Ép log với thông tin tùy chỉnh
    req._auditAction = 'EXPORT_SALARY_REPORT';
    req._auditResource = 'reports';
    req._auditDetails = { month: '2026-05' };

    auditMiddleware(req, res, next);
    res.emit('finish');

    expect(auditService.logRequest).toHaveBeenCalledWith(expect.objectContaining({
      action: 'EXPORT_SALARY_REPORT',
      resource: 'reports',
      details: { month: '2026-05' },
      method: 'GET', // GET nhưng vẫn được log do có _auditAction
    }));
  });

  it('bỏ qua log nếu req._skipAudit = true', () => {
    req._skipAudit = true;

    auditMiddleware(req, res, next);
    res.emit('finish');

    expect(auditService.logRequest).not.toHaveBeenCalled();
  });
});
