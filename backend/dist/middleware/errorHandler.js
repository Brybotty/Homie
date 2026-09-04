"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppError = void 0;
exports.errorHandler = errorHandler;
class AppError extends Error {
    statusCode;
    details;
    constructor(message, statusCode = 400, details) {
        super(message);
        this.statusCode = statusCode;
        this.details = details;
        Object.setPrototypeOf(this, AppError.prototype);
    }
}
exports.AppError = AppError;
function errorHandler(err, _req, res, _next) {
    const statusCode = err instanceof AppError ? err.statusCode : 500;
    const message = err.message || 'Error interno del servidor';
    const details = err instanceof AppError ? err.details : undefined;
    if (statusCode === 500) {
        console.error('[Unhandled Server Error]', err);
    }
    res.status(statusCode).json({
        success: false,
        error: message,
        ...(details ? { details } : {}),
    });
}
