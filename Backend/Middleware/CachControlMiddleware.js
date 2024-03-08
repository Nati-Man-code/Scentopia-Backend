const CACHE_TIME = 60 * 60 * 24 * 7; // 1 week

/**
 * Cache-Control middleware.
 *
 * Sets the Cache-Control header with a value of
 * "public, max-age=<CACHE_TIME>",
 * where <CACHE_TIME> is the number of seconds that the response
 * should be cached by clients.
 *
 * Example usage:
 * app.use(cacheControl(60 * 60 * 24 * 7)); // Cache responses for 1 week
 *
 * @param {number} cacheTime - The number of seconds that a response should
 *                             be cached.
 */
const cacheControl = (cacheTime) => {
  return (req, res, next) => {
    // If there is no cacheTime specified, or if the cacheTime is less
    // than or equal to 0, set the Cache-Control header to "no-cache"
    // to prevent clients from caching the response.
    if (!cacheTime || cacheTime <= 0) {
      res.set('Cache-Control', 'no-cache');
    } else {
      // Otherwise, set the Cache-Control header to a public, max-age
      // directive specifying the number of seconds that the response
      // should be cached.
      res.set('Cache-Control', `public, max-age=${cacheTime}`);
    }

    next();
  };
};

