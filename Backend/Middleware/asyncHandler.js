/**
 * asyncHandler Middleware for handling async functions in Express Routes.
 * @param {Function} callback - Async function to be executed.
 * @returns {Function} Express middleware function
 */
const asyncHandler = (callback) => {
    return (req, res, next) => {
        const routePromise = callback(req, res, next);
        if (routePromise.constructor.name === 'Promise') {
            routePromise.then(() => { }).catch((error) => {
                if (error instanceof Error) {
                    console.error(`[${new Date().toLocaleString()}] AsyncHandler Error: ${error.stack}`);
                    res.status(500).json({ error: error.message });
                } else {
                    console.error(`[${new Date().toLocaleString()}] AsyncHandler Error:`, error);
                    res.status(500).json({ error: 'Internal Server Error' });
                }
            });
        } else {
            next();
        }
    };
};



