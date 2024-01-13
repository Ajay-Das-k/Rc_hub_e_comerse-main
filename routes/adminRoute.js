const express = require("express");
const adminRoute = express();
const session = require("express-session");
const config = require("../config/config");
const imageUploader = require("../config/multer");
const auth = require("../middleware/adminAuth");
const adminController = require("../controllers/adminController");
const productController = require("../controllers/productController");
const categoryController = require("../controllers/categoryController");
const brandController = require("../controllers/brandController");
const bannerController = require("../controllers/bannerController");
const couponController = require("../controllers/couponController");
const offerController = require("../controllers/offerController");
const dealController = require("../controllers/dealController");
const { dealDashboard } = require("../controllers/dealController");

adminRoute.use(session({ secret: config.sessionSecret }));
adminRoute.use(express.json());
adminRoute.use(express.urlencoded({ extended: true }));
adminRoute.set("view engine", "ejs");
adminRoute.set("views", "./views/admin");
adminRoute.use(express.static("public"));

// Main Login Routes
adminRoute.get("/", auth.isLogout, adminController.loadLogin);
adminRoute.post("/", adminController.verifyLogin);

// Main Dashboard Routes
adminRoute.get("/home", auth.isLogin, adminController.loadDashboard);
adminRoute.get("/logout", auth.isLogin, adminController.logout);
adminRoute.get("/adminForget", auth.isLogout, adminController.forgetLoad);
adminRoute.post("/adminForget", adminController.forgetVerify);
adminRoute.get("/Forget-password", auth.isLogout,adminController.forgetPasswordLoad);
adminRoute.post("/Forget-password", adminController.resetPassword);

// User Dashboard Routes
adminRoute.get("/dashboard", auth.isLogin, adminController.adminDashboard);
adminRoute.get("/new-user", auth.isLogin, adminController.newUserLoad);
adminRoute.post(
  "/new-user",
  imageUploader.uploadUser.single("image"),
  imageUploader.userImgResize,
  adminController.addUser
);
adminRoute.get("/edit-user", auth.isLogin, adminController.editUserLoad);
adminRoute.post("/edit-user", adminController.updateUsers);
adminRoute.get("/delete-user", adminController.deleteUser);

// Product Dashboard Routes
adminRoute.get(
  "/productDashboard",
  auth.isLogin,
  productController.productDashboard
);
adminRoute.get("/new-product", auth.isLogin, productController.newProductLoad);
adminRoute.post(
  "/new-product",
  imageUploader.uploadProduct.array("coverPic", 15),
  imageUploader.productImgResize,
  productController.addProduct
);
adminRoute.get(
  "/edit-product",
  auth.isLogin,
  productController.editProductLoad
);
adminRoute.post(
  "/edit-product",
  imageUploader.uploadProduct.array("coverPic", 7),
  productController.updateProduct
);
adminRoute.delete("/removeImage", productController.removeImage);

adminRoute.patch(
  "/uploadImage/:productId",
  imageUploader.uploadProduct.array("coverPic"),
  imageUploader.productImgResize,
  productController.uploadImage
);
// Category Dashboard Routes
adminRoute.get("/categoryDashboard",auth.isLogin,categoryController.categoryDashboard);
adminRoute.get(
  "/new-category",
  auth.isLogin,
  categoryController.newCategoryLoad
);
adminRoute.post(
  "/new-category",
  imageUploader.uploadCategory.single("coverPic"),
  categoryController.addCategory
);
adminRoute.get(
  "/edit-category",
  auth.isLogin,
  categoryController.editCategoryLoad
);
adminRoute.post(
  "/edit-category",
  imageUploader.uploadCategory.single("coverPic"),
  categoryController.updateCategory
);

// Banner Dashboard Routes
adminRoute.get(
  "/bannerDashboard",
  auth.isLogin,
  bannerController.bannerDashboard
);
adminRoute.get("/new-banner", auth.isLogin, bannerController.newBannerLoad);
adminRoute.post(
  "/new-banner",
  imageUploader.uploadBanner.single("coverPic"),
  bannerController.addBanner
);
adminRoute.get("/edit-banner", auth.isLogin, bannerController.editBannerLoad);
adminRoute.post(
  "/edit-banner",
  imageUploader.uploadBanner.single("coverPic"),
  bannerController.updateBanner
);

// Brand Dashboard Routes
adminRoute.get("/brandDashboard", auth.isLogin, brandController.brandDashboard);

adminRoute.get("/new-brand", auth.isLogin, brandController.newBrandLoad);

adminRoute.post("/new-brand",imageUploader.uploadBrand.single("coverPic"),auth.isLogin,brandController.addBrand);

adminRoute.get("/edit-brand", auth.isLogin, brandController.editBrandLoad);

adminRoute.post(
  "/edit-brand",
  imageUploader.uploadBrand.single("coverPic"),
  brandController.updateBrand
);

// Product Order Routes
adminRoute.get("/orderDashboard", auth.isLogin, adminController.orderDashboard);
adminRoute.get(
  "/orderFullDetails",
  auth.isLogin,
  adminController.adminOrderFullDetails
);
adminRoute.post(
  "/orderFullDetails/changeStatus",
  auth.isLogin,
  adminController.changeOrderStatus
);
adminRoute.post(
  "/adminCancelOrder",
  auth.isLogin,
  adminController.adminCancelOrder
);




// coupon $ offers


adminRoute.get(
  "/couponDashboard",
  auth.isLogin,
  couponController.loadCouponMangements
);


adminRoute.get(
  "/new-coupon",
  auth.isLogin,
  couponController.loadAddCouponMangements
);



adminRoute.post("/new-coupon",auth.isLogin, couponController.addNewCoupon);

adminRoute.get("/editcoupon",
  auth.isLogin,
  couponController.loadEditCouponMangements
);

adminRoute.post("/editcoupon", auth.isLogin,couponController.editCoupon);
adminRoute.get("/deletecoupon",auth.isLogin,couponController.deleteCoupon);





adminRoute.get("/offerDashboard", auth.isLogin, offerController.loadOffer);

adminRoute.get("/new-offer", auth.isLogin, offerController.loadaddOffer);

adminRoute.get("/editOffer/:id",auth.isLogin,offerController.loadEditOffer);

adminRoute.post("/new-offer", auth.isLogin, offerController.AddOffer);

adminRoute.post("/editOffer", auth.isLogin, offerController.postEditOffer);

adminRoute.patch( "/cancelOffer",auth.isLogin,offerController.cancelOffer);

adminRoute.patch("/apply_offer",auth.isLogin,productController.applyProductOffer);

adminRoute.patch("/remove_offer",auth.isLogin,productController.removeProductOffer);


// category offer

adminRoute.patch("/apply_category_offer", auth.isLogin,categoryController.applyCategoryOffer);

adminRoute.patch(
  "/remove_CAtegory_offer",
  auth.isLogin,
  categoryController.removeCategoryOffer
);

adminRoute.get("/chat", auth.isLogin, adminController.chatScreen);



// deal Dashboard Routes
adminRoute.get("/brandDashboard", auth.isLogin, dealController.dealDashboard);

// adminRoute.get("/new-brand", auth.isLogin, brandController.newBrandLoad);

// adminRoute.post("/new-brand",imageUploader.uploadBrand.single("coverPic"),auth.isLogin,brandController.addBrand);

// adminRoute.get("/edit-brand", auth.isLogin, brandController.editBrandLoad);

// adminRoute.post(
//   "/edit-brand",
//   imageUploader.uploadBrand.single("coverPic"),
//   brandController.updateBrand
// );


// Default Route
// adminRoute.get('*', function(req, res) {
//   res.redirect('/admin');
// });

module.exports = adminRoute;
