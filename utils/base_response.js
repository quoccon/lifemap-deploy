// utils/responseHelper.js

const STATUS_CODE = {
    SUCCESS: '00',
    VALIDATION_ERROR: '400',
    UNAUTHORIZED: '401',
    FORBIDDEN: '403',
    NOT_FOUND: '404',
    SERVER_ERROR: '500',
};

const sendResponse = (res, httpCode, message, data = null) => {
    const code = httpCode === 200 || httpCode === 201
        ? STATUS_CODE.SUCCESS
        : httpCode.toString();

    return res.status(httpCode).json({
        code,
        message,
        data,
    });
};

const sendSuccess = (res, message = 'Success', data = null) => {
    return sendResponse(res, 200, message, data);
};

const sendCreated = (res, message = 'Created', data = null) => {
    return sendResponse(res, 201, message, data);
};

const sendBadRequest = (res, message = 'Bad request', data = null) => {
    return sendResponse(res, 400, message, data);
};

const sendUnauthorized = (res, message = 'Unauthorized', data = null) => {
    return sendResponse(res, 401, message, data);
};

const sendForbidden = (res, message = 'Forbidden', data = null) => {
    return sendResponse(res, 403, message, data);
};

const sendNotFound = (res, message = 'Not found', data = null) => {
    return sendResponse(res, 404, message, data);
};

const sendServerError = (res, message = 'Internal server error', data = null) => {
    return sendResponse(res, 500, message, data);
};

module.exports = {
    STATUS_CODE,
    sendResponse,
    sendSuccess,
    sendCreated,
    sendBadRequest,
    sendUnauthorized,
    sendForbidden,
    sendNotFound,
    sendServerError,
};
