//session
const session = require('express-session');

const session = (req, res, next) => {
    if (!req.session) {
        return next(new Error('Session middleware not initialized'));
    }
    req.session.nowInMinutes = Math.floor(Date.now() / 60000);
    next();
};

module.exports = session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 30, // 30 days
    },
});

