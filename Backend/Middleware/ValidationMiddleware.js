const Joi = require('joi');

/**
 * Validation Middleware.
 * This middleware is used to validate the request body, query parameters, and request data against a schema.
 * If the request data is not valid, it will respond with a 400 status code and an error message.
 * @param {Object} schema - The Joi schema object used to validate the request data.
 */
const validate = (schema) => {
    return (req, res, next) => {
        /**
         * Validate Request Body
         */
        const bodyValidationResult = schema.validate(req.body);
        if (bodyValidationResult.error) {
            const message = bodyValidationResult.error.details.map(detail => detail.message).join(', ');
            return res.status(400).send({ error: `Invalid request body: ${message}` });
        }
        req.body = bodyValidationResult.value;

        /**
         * Validate Request Query Parameters
         */
        const queryValidationResult = schema.validate(req.query);
        if (queryValidationResult.error) {
            const message = queryValidationResult.error.details.map(detail => detail.message).join(', ');
            return res.status(400).send({ error: `Invalid query parameters: ${message}` });
        }
        req.query = queryValidationResult.value;

        /**
         * Validate Request Params
         */
        const paramsValidationResult = schema.validate(req.params);
        if (paramsValidationResult.error) {
            const message = paramsValidationResult.error.details.map(detail => detail.message).join(', ');
            return res.status(400).send({ error: `Invalid request params: ${message}` });
        }
        req.params = paramsValidationResult.value;

        next();
    };
};






module.exports = {
    validate,
    schemas,
};


