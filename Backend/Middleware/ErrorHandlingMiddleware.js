// Middleware for handling errors
const errorHandler = (err, req, res, next) => {
    // Get the error status code and message
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';

    // Log the error stack
    console.error(err.stack);

    // Send the error response
    res.status(statusCode).json({
        status: statusCode,
        message: message,
        error: {
            message: err.message,
            stack: process.env.NODE_ENV === 'production' ? null : err.stack
        }
    });
};



/**
 * Not Found Middleware
 *
 * If no matching route is found, the request is routed to this
 * middleware function, which returns a 404 error to the client.
 */
const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);

  // Set the HTTP status code to 404
  error.status = 404;

  // Set the error message to send to the client
  error.message = `Not Found - ${req.originalUrl}`;

  // Set the error stack trace (if in dev mode)
  if (process.env.NODE_ENV === 'development') {
    // Get the stack trace
    const stackTrace = error.stack;

    // Add the stack trace to the error object
    error = {
      ...error,
      stackTrace,
    };
  }

  // Log the error to the console
  console.error(error);

  // Send the error response to the client
  res.status(error.status).json({
    message: error.message,
    stack: error.stackTrace,
  });
};


  
module.exports = errorHandler;

