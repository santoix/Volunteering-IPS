const jwt = require("jsonwebtoken");
const User = require("../../models/user.model");
var restrictedRoutes = require("../../restrictedRoutes/restrictedRoutes.js");
//require('dotenv').config({ path: '../../../' });
var config = require("../../config");

module.exports = (req, res, next) => {
  const token = req.cookies.token;
  //const referer = req.headers.referer.split("/").pop();
  if (!token)
    return false;

  try {
    const decoded = jwt.verify(token, config.jwtPrivateKey);
    //req.user = decoded;
    User.findOne({ _id: decoded._id }, (err, user) => {
      if (err)
        return false;
      else {
        const role = user.role;
        const page = req.headers.referer.split(req.headers.origin).pop().split('/')[1];
        if (restrictedRoutes[role].includes(page)) {
          return false;
        }
        else if (user.isInactive)
          return false;

        return true;
      }
    });
    next();
  } catch (er) {
    res.clearCookie("token");
    return false;
  }
};