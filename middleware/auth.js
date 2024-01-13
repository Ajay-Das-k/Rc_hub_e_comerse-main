
const User=require("../models/userModel")

const isLogin = async (req, res, next) => {
  try {
    if (req.session.user_id) {
      next(); // Move next() inside the if block
    } else {
      res.redirect("/");
    }
  } catch (error) {
    console.log(error.message);
  }
};
const checkBlock= async (req, res, next) => {
  try {
    const userData = await User.findById(req.session.user_id);
    if (userData.is_block === 0) {
      res.render("login", { message: "Blocked By Admin" });
       // Move next() inside the if block
    } else {
      next();
    }
  } catch (error) {
    console.log(error.message);
  }
};

const isLogout = async (req, res, next) => {
  try {
    if (req.session.user_id) {
      res.redirect("/home");
    } else {
      next(); // Move next() inside the else block
    }
  } catch (error) {
    console.log(error.message);
  }
};

module.exports = {
  isLogin,
  isLogout,
  checkBlock,
};
