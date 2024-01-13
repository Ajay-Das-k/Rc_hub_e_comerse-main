const express = require("express");
const userRoute = express();
const session = require("express-session");
const config = require("../config/config");
const auth = require("../middleware/auth");
const imageUploader = require("../config/multer");
const userController = require("../controllers/userController");
const cartController = require("../controllers/cartController");
const orderController = require("../controllers/orderController");
const contactController = require("../controllers/contactController");
const couponController = require("../controllers/couponController");

userRoute.use(session({ secret: config.sessionSecret }));
userRoute.set("view engine", "ejs");
userRoute.set("views", "./views/users");
userRoute.use(express.json());
userRoute.use(express.urlencoded({ extended: true }));
userRoute.use(express.static("public"));



// Login Routes
userRoute.get("/", auth.isLogout, userController.loadHome);
userRoute.get("/login", auth.isLogout, userController.loginLoad);
userRoute.post("/login", userController.verifyLogin);
userRoute.get("/logout",  auth.isLogin,auth.checkBlock, userController.userLogout);



// Verification Routes
userRoute.get("/register", auth.isLogout, userController.loadRegister);
userRoute.post("/register",imageUploader.uploadUser.single("image"),imageUploader.userImgResize,userController.insertUser);
userRoute.get("/verify", userController.verifyMail);



// Forget Password Routes
userRoute.get("/forget", auth.isLogout, userController.forgetLoad);
userRoute.post("/forget", userController.forgetVerify);
userRoute.get(
  "/forget-password",
  auth.isLogout,
  userController.forgetPasswordLoad
);
userRoute.post("/forget-password", userController.resetPassword);

// Verification Link Routes
userRoute.get("/verification", userController.verificationLoad);
userRoute.post("/verification", userController.sentVerificationLink);

// Change Password Route
userRoute.post(
  "/changepassword", auth.isLogin,auth.checkBlock,userController.changePassword
);

// Home Route
userRoute.get("/home", auth.isLogin,auth.checkBlock,  userController.loadHome);

// User Profile Routes
userRoute.get("/edit",  auth.isLogin,auth.checkBlock,  userController.editLoad);
userRoute.post(
  "/updateprofile",
  imageUploader.uploadUser.single("image"),
  imageUploader.userImgResize,
  userController.updateProfile
);

// Shop Route
userRoute.get("/shop", userController.shopLoad);

// Contact Routes
userRoute.get("/contact", auth.isLogin,auth.checkBlock,contactController.contactLoad);
userRoute.post("/contact",auth.checkBlock, contactController.newContact);

// Wish List Route
userRoute.get("/wishList",auth.checkBlock, userController.wishListLoad);

// Address Routes
userRoute.post("/address",  auth.isLogin,auth.checkBlock, userController.addAddress);
userRoute.post(
  "/updateAddress",
   auth.isLogin,auth.checkBlock,
  userController.updateUserAddress
);
userRoute.post(
  "/deleteAddress",
   auth.isLogin,auth.checkBlock,
  userController.deleteUserAddress
);

// Single Product Route
userRoute.get(
  "/singleProduct/:id",userController.singleProductLoad
);

// Cart Routes
userRoute.get("/cart",  auth.isLogin,auth.checkBlock, cartController.loadCart);
userRoute.post("/addTocart",  auth.isLogin,auth.checkBlock, cartController.addToCart);
userRoute.post("/cart-quantity",  auth.isLogin,auth.checkBlock, cartController.cartQuantity);
userRoute.post("/remove-product",  auth.isLogin,auth.checkBlock, cartController.removeProduct);

// Checkout Route
userRoute.get("/checkout",  auth.isLogin,auth.checkBlock, orderController.loadCheckOut);
userRoute.post("/placeOrder",  auth.isLogin,auth.checkBlock, orderController.placeOrder);

// Order Confirmation Route
userRoute.get("/orderPlaced/:id", orderController.orderPlacedPageLoad);

// Orders Routes
userRoute.get("/orders",  auth.isLogin,auth.checkBlock, orderController.loadOrderPage);
userRoute.get("/orderDetails",  auth.isLogin,auth.checkBlock, orderController.orderDetails);
userRoute.post("/orderCancel", orderController.cancelOrder);
userRoute.post("/productReturn",  auth.isLogin,auth.checkBlock, orderController.productReturn);
userRoute.get("/download",  auth.isLogin,auth.checkBlock, orderController.generatePdf);

// Payments And Address Verification Routes
userRoute.post("/verifyPayment",  auth.isLogin,auth.checkBlock, orderController.verifyPayment);
userRoute.post(
  "/checkoutAddress",
   auth.isLogin,auth.checkBlock,
  orderController.addCheckoutAddress
);
userRoute.get(
  "/editCheckoutAddress",
   auth.isLogin,auth.checkBlock,
  orderController.loadCheckoutEditAddress
);
userRoute.post(
  "/editCheckoutAddress",
   auth.isLogin,auth.checkBlock,
  orderController.editCheckoutAddress
);

// Wallet Routes
userRoute.post(
  "/profile/addMoneyToWallet",
   auth.isLogin,auth.checkBlock,
  userController.postAddMoneyToWallet
);
userRoute.post(
  "/verifyWalletpayment",
   auth.isLogin,auth.checkBlock,
  userController.postVerifyWalletPayment
);
// coupon


userRoute.post("/couponApply", auth.isLogin, couponController.ApplyCoupon);
userRoute.post("/deleteCoupon", auth.isLogin,couponController.deleteAppliedCoupon);


userRoute.post("/referralCodeApply",auth.isLogin,couponController.ApplyreferralCode);

module.exports = userRoute;
