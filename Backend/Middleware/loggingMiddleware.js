// Middleware for logging requests and responses
const loggingMiddleware = (req, res, next) => {
    const requestTime = new Date().toLocaleString();

    // Request logging
    console.log(`[${requestTime}] Request: ${req.method} ${req.url}`);
    console.log(`[${requestTime}] Request headers: ${JSON.stringify(req.headers)}`);
    console.log(`[${requestTime}] Request body: ${JSON.stringify(req.body)}`);

    // Response logging
    const originalSend = res.send;
    res.send = function (data) {
        const responseTime = new Date().toLocaleString();
        console.log(`[${responseTime}] Response time: ${responseTime - requestTime}ms`);
        console.log(`[${responseTime}] Response status: ${res.statusCode}`);
        console.log(`[${responseTime}] Response headers: ${JSON.stringify(res.getHeaders())}`);
        console.log(`[${responseTime}] Response body: ${JSON.stringify(data)}`);

        originalSend.apply(res, arguments);
    };

    next();
};


module.exports = loggingMiddleware;
