exports.isAuthenticated = (req, res, next) => {
    console.log('Auth check:', req.isAuthenticated());

    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/auth/login');
};

exports.isNotAuthenticated = (req, res, next) => {
    if (!req.isAuthenticated()) {
        return next();
    }
    res.redirect('/');
};

exports.isAdmin = (req, res, next) => {
    if (req.isAuthenticated() && req.user.role === 'admin') {
        return next();
    }
    res.status(403).json({ message: 'Access denied' });
};