const cache = (duration) => {
    return (req, res, next) => {
        if (req.method === 'GET') {
            res.set('Cache-Control', `public, max-age=${duration}`);
        }
        next();
    };
};

module.exports = cache;