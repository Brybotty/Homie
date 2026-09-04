"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = void 0;
const express_validator_1 = require("express-validator");
const errorHandler_1 = require("./errorHandler");
const validate = (validations) => {
    return async (req, _res, next) => {
        for (const validation of validations) {
            const result = await validation.run(req);
            if (!result.isEmpty())
                break;
        }
        const errors = (0, express_validator_1.validationResult)(req);
        if (errors.isEmpty()) {
            return next();
        }
        const formattedErrors = errors.array().map((err) => ({
            field: err.path || err.param,
            message: err.msg,
        }));
        next(new errorHandler_1.AppError('Errores de validación en la solicitud', 422, formattedErrors));
    };
};
exports.validate = validate;
