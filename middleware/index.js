const administrator = process.env.ADMINISTRATOR || process.env.LOCALADMIN;
const middleware = {}
require('dotenv').config();

middleware.isLoggedIn = (req, res, next) => {
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect('/login');
}

middleware.loggedInInaccessible = (req, res, next) => {
    if(req.isAuthenticated()){
        return res.redirect('/');
    }
    return next();
}

middleware.isAdminLoggedIn = (req, res, next) => {
    if(req.user._id.equals(administrator) || req.user.admin){
        return next();
    }
    res.redirect('back');
}

middleware.redirectToAdminHub = (req, res, next) => {
    if(req.user._id.equals(administrator) || req.user.admin)
        return res.redirect('/adminhub');
    else
        return next();
}

middleware.redirectToBoothRoute = (req, res, next) => {
    if(req.user.booth)
        return res.redirect('/');
    else
        return next();
}

middleware.redirectToJudgeRoute = (req, res, next) => {
    if(req.user.judge)
        return res.redirect('/awards/judge');
    else
        return next();
}

middleware.routeInaccessible = (req, res, next) => {
    if(req.isAuthenticated()){
        return res.redirect('back');
    }
}

module.exports = middleware;