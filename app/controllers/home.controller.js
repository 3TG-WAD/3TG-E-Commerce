exports.getHomePage = (req, res) => {
    try {
        res.render('home', {
            title: '3TG E-Commerce',
            user: req.user || null
        });
    } catch (error) {
        console.error('Home page error:', error);
        res.status(500).render('error/500', {
            title: '500 - Server Error'
        });
    }
}; 