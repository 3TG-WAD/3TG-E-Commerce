module.exports = (req, res, next) => {
    // Set default title if none is provided
    res.locals.title = res.locals.title || '3TG E-Commerce';
    // Make user available in all views
    res.locals.user = req.user || null;
    next();
}; 