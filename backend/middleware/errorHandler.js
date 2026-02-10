const errorHandler = (err, req, res, next) => {
    console.error('Lỗi:', err);

    // Lỗi validation
    if (err.name === 'ValidationError') {
        return res.status(400).json({
            message: 'Dữ liệu không hợp lệ',
            errors: err.errors
        });
    }

    // Lỗi database
    if (err.code && err.code.startsWith('ER_')) {
        return res.status(500).json({
            message: 'Lỗi cơ sở dữ liệu',
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }

    // Lỗi mặc định
    res.status(err.status || 500).json({
        message: err.message || 'Đã xảy ra lỗi máy chủ',
        error: process.env.NODE_ENV === 'development' ? err : undefined
    });
};

module.exports = errorHandler;
