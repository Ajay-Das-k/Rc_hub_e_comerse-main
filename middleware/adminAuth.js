const User = require("../models/userModel");
const isLogin = async (req, res, next) => {
  try {
    if (req.session.user_id) {
         const userData = await User.findById(req.session.user_id);

         if (userData.is_admin === 0) {
           res.redirect("/404");
         } else {
           next();
         }

    } else {
      res.redirect("/admin");
    }
    
  } catch (error) {
    console.log(error.message);
  }
};

const isLogout = async (req, res, next) => {
  try {
    if (req.session.user_id) {
      res.redirect("/admin/home");
    }
    next();
  } catch (error) {
    console.log(error.message);
  }
};

module.exports = {
  isLogin,
  isLogout,
};
