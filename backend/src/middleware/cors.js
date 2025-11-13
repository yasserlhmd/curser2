/**
 * Native CORS middleware
 * Replaces cors package with native Express middleware
 */

/**
 * CORS middleware factory
 * @param {Object} options - CORS options
 * @returns {Function} Express middleware function
 */
const cors = (options = {}) => {
  const {
    origin = '*',
    methods = ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders = ['Content-Type', 'Authorization'],
    credentials = false,
    maxAge = 86400, // 24 hours
  } = options;

  // Normalize origin
  const allowedOrigin = typeof origin === 'function' 
    ? origin 
    : (req, callback) => {
        const requestOrigin = req.headers.origin;
        if (origin === '*' || (Array.isArray(origin) && origin.includes(requestOrigin))) {
          callback(null, origin === '*' ? '*' : requestOrigin);
        } else {
          callback(null, false);
        }
      };

  return (req, res, next) => {
    const originHeader = req.headers.origin;
    let responseOrigin = '*';
    
    // Determine allowed origin
    if (typeof allowedOrigin === 'function') {
      allowedOrigin(req, (err, origin) => {
        if (!err && origin) {
          responseOrigin = origin;
        } else {
          responseOrigin = originHeader || '*';
        }
        setCorsHeaders(res, responseOrigin, methods, allowedHeaders, credentials, maxAge);
        
        // Handle preflight requests
        if (req.method === 'OPTIONS') {
          res.status(204).end();
          return;
        }
        next();
      });
    } else {
      responseOrigin = allowedOrigin === '*' ? originHeader || '*' : allowedOrigin;
      setCorsHeaders(res, responseOrigin, methods, allowedHeaders, credentials, maxAge);
      
      // Handle preflight requests
      if (req.method === 'OPTIONS') {
        res.status(204).end();
        return;
      }
      next();
    }
  };
};

/**
 * Set CORS headers on response
 */
const setCorsHeaders = (res, origin, methods, allowedHeaders, credentials, maxAge) => {
  if (origin !== false) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  
  if (credentials && origin !== '*') {
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }
  
  res.setHeader('Access-Control-Allow-Methods', methods.join(', '));
  res.setHeader('Access-Control-Allow-Headers', allowedHeaders.join(', '));
  res.setHeader('Access-Control-Max-Age', maxAge.toString());
};

module.exports = cors;

