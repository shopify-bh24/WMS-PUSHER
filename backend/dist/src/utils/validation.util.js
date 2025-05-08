import { ValidationError } from './error.util.js';
export const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};
export const validatePassword = (password) => {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
    return passwordRegex.test(password);
};
export const validatePhoneNumber = (phone) => {
    const phoneRegex = /^\+?[\d\s-]{10,}$/;
    return phoneRegex.test(phone);
};
export const validateRequiredFields = (data, requiredFields) => {
    const missingFields = requiredFields.filter(field => !data[field]);
    if (missingFields.length > 0) {
        throw new ValidationError(`Missing required fields: ${missingFields.join(', ')}`);
    }
};
export const validateNumericRange = (value, min, max) => {
    return value >= min && value <= max;
};
export const validateStringLength = (str, min, max) => {
    return str.length >= min && str.length <= max;
};
export const validateDateRange = (startDate, endDate) => {
    return startDate <= endDate;
};
export const sanitizeString = (str) => {
    return str.trim().replace(/[<>]/g, '');
};
export const validateObjectId = (id) => {
    const objectIdRegex = /^[0-9a-fA-F]{24}$/;
    return objectIdRegex.test(id);
};
//# sourceMappingURL=validation.util.js.map