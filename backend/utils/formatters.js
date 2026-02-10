/**
 * Convert string từ snake_case thành camelCase
 * @param {string} str 
 * @returns {string}
 */
const toCamelCaseString = (str) => {
    return str.replace(/([-_][a-z])/g, (group) =>
        group.toUpperCase()
            .replace('-', '')
            .replace('_', '')
    );
};

/**
 * Convert object keys từ snake_case thành camelCase
 * @param {Object|Array} obj 
 * @returns {Object|Array}
 */
const toCamelCase = (obj) => {
    if (obj === null || typeof obj !== 'object' || obj instanceof Date) {
        return obj;
    }

    if (Array.isArray(obj)) {
        return obj.map(v => toCamelCase(v));
    }

    return Object.keys(obj).reduce((acc, key) => {
        const camelKey = toCamelCaseString(key);
        acc[camelKey] = toCamelCase(obj[key]);
        return acc;
    }, {});
};

module.exports = {
    toCamelCase
};
