exports.getHomePage = (req, res) => {
    res.render('home', {
        title: '3TG E-Commerce',
        user: req.user || null
    });
}; 