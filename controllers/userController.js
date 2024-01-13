const User = require("../models/userModel");
const Brand = require("../models/brandModel");
const Banner = require("../models/bannerModel");
const Category = require("../models/categoryModel");
const Product = require("../models/productModel");
const Address = require("../models/userAddress");
const couponDb = require("../models/couponModel");
const Wishlist = require("../models/wishlist");
const Cart = require("../models/cart");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const config = require("../config/config");
const randormstring = require("randomstring");
const Razorpay = require("razorpay");
const crypto = require("crypto");
var instance = new Razorpay({
  key_id: process.env.KEY_ID,
  key_secret: process.env.KEY_SECRET,
});

// ==============================================================SECURING THE PASSWORD================================================================
const securePassword = async (password) => {
  try {
    const passwordHash = await bcrypt.hash(password, 10);
    return passwordHash;
   } catch (error) {console.log(error.message);
    throw new Error(error);
  }
};

//for send mail
const sendVerifyMail = async (name, email, user_id) => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      requireTLS: true,
      auth: {
        user: config.emailUser,
        pass: config.emailPassword,
      },
    });
    const mailOptions = {
      from: config.emailUser,
      to: email,
      subject: "For Verification mail",
      html:
        "<p>Hii" +
        name +
        ', please click here to <a href="https://rc-hub-ecomerse.onrender.com/verify?id=' +user_id +'"> Verify </a> your mail.</p>',
    };
    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log("Email has been sent:- ", info.response);
      }
    });
   } catch (error) {console.log(error.message);
    throw new Error(error);
  }
};

//for reset password send mail
const sendResetPasswordMail = async (name, email, token) => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      requireTLS: true,
      auth: {
        user: config.emailUser,
        pass: config.emailPassword,
      },
    });
    const mailOptions = {
      from: config.emailUser,
      to: email,
      subject: "For Reset Password",
      html:
        "<p>Hii " +
        name +
        ', please click here to <a href="https://rc-hub-ecomerse.onrender.com/forget-password?token=' +
        token +
        '"> Reset </a> your password.</p>',
    };
    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log("Email has been sent:- ", info.response);
      }
    });
   } catch (error) {console.log(error.message);
    throw new Error(error);
  }
};

const loadRegister = async (req, res) => {
  try {
    const categoryData = await Category.find().populate("offer").exec();
    const cart = await Cart.findOne({ user: req.session.user_id })
      .populate("products.productId")
      .exec();

    res.render("registration", { cart: cart, category: categoryData });
   } catch (error) {console.log(error.message);
    throw new Error(error);
  }
};
// Function to generate a random 6-digit number
function generateRandomReferralCode() {
  const randomNumber = Math.floor(100000 + Math.random() * 900000);
  const randomChars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  // Generate additional characters to make it a 10-character code
  let additionalChars = "";
  for (let i = 0; i < 4; i++) {
    const randomIndex = Math.floor(Math.random() * randomChars.length);
    additionalChars += randomChars.charAt(randomIndex);
  }

  // Combine the random number and additional characters
  const referralCode = "welcome" + randomNumber.toString() + additionalChars;
  return referralCode;
}

const insertUser = async (req, res) => {
  try {
    const spassword = await securePassword(req.body.password);
    const existingUserEmail = await User.findOne({ email: req.body.email });
    const existingUserMobile = await User.findOne({ mobile: req.body.mno });
    const referralCode = generateRandomReferralCode();
    const categoryData = await Category.find().populate("offer").exec();
    const cart = await Cart.findOne({ user: req.session.user_id })
      .populate("products.productId")
      .exec();

    

    if (existingUserEmail) {
      return res.render("registration", {
        emailMessage: "Email already exists.",
        cart: cart,
        category: categoryData,
      });
    }

    if (existingUserMobile) {
      return res.render("registration", {
        emailMessage: "Mobile number already exists.",
        cart: cart,
        category: categoryData,
      });
    }

    // if (req.body.password !== req.body.verify_password) {
    //     return res.render('registration', { message: "Passwords do not match." });
    // }

    const user = new User({
      name: req.body.name,
      email: req.body.email,
      mobile: req.body.mno,
      image: req.file.filename,
      password: spassword,
      referralCode:referralCode,
      is_admin: 0,
    });

    const userData = await user.save();

    if (userData) {
      sendVerifyMail(req.body.name, req.body.email, userData._id);
      res.render("registration", {
        message:
          "Your registration has been successful. Please verify your email.",
        cart: cart,
        category: categoryData,
      });
    } else {
      res.render("registration", {
        message: "Your registration has failed.",
        cart: cart,
        category: categoryData,
      });
    }
   } catch (error) {console.log(error.message);
    throw new Error(error);
    res.render("registration", {
      message: "An error occurred during registration.",
      cart: cart,
      category: categoryData,
    });
  }
};

const verifyMail = async (req, res) => {
  try {
    const categoryData = await Category.find().populate("offer").exec();
    const cart = await Cart.findOne({ user: req.session.user_id })
      .populate("products.productId")
      .exec();

    const updateInfo = await User.updateOne(
      { _id: req.query.id },
      { $set: { is_varified: 1 } }
    );

    console.log(updateInfo);
    res.render("email-verified", { cart: cart, category: categoryData });
   } catch (error) {console.log(error.message);
    throw new Error(error);
  }
};

// login user methods started

const loginLoad = async (req, res) => {
  try {
    const categoryData = await Category.find().populate("offer").exec();
    const cart = await Cart.findOne({ user: req.session.user_id })
      .populate("products.productId")
      .exec();

    res.render("login", { cart: cart, category: categoryData });
   } catch (error) {console.log(error.message);
    throw new Error(error);
  }
};

const verifyLogin = async (req, res) => {
  try {
    const categoryData = await Category.find().populate("offer").exec();
    const cart = await Cart.findOne({ user: req.session.user_id })
      .populate("products.productId")
      .exec();

    const email = req.body.email;
    const password = req.body.password;

    const userData = await User.findOne({ email: email });

    if (userData) {
      const passwordMatch = await bcrypt.compare(password, userData.password);
      if (passwordMatch) {
        if (userData.is_varified === 0) {
          res.render("login", {
            message: "Please verify your mail.",
            cart: cart,
            category: categoryData,
          });
        } else if (userData.is_block === 0) {
          res.render("login", {
            message: "Blocked By Admin",
            cart: cart,
            category: categoryData,
          });
        } else {
          req.session.user_id = userData._id;
          res.redirect("/home");
        }
      } else {
        res.render("login", {
          message: "Email and password is incorrect ",
          cart: cart,
          category: categoryData,
        });
      }
    } else {
      res.render("login", {
        message: "Email and password is incorrect",
        cart: cart,
        category: categoryData,
      });
    }
   } catch (error) {console.log(error.message);
    throw new Error(error);
  }
};

const loadHome = async (req, res) => {
  try {
    let userData;
    if (req.session.user_id) {
      userData = await User.findById(req.session.user_id);
    }

    const brandData = await Brand.find();
    const productData = await Product.find()
      .populate("brand category offer")
      .populate({
        path: "category",
        populate: {
          path: "offer",
        },
      })
      .exec();
    const bannerData = await Banner.find({ is_block: true })
      .populate("product")
      .exec();
    const categoryData = await Category.find().populate("offer").exec();
    const cart = await Cart.findOne({ user: req.session.user_id })
      .populate("products.productId")
      .exec();

    // Render the view with the data
    res.render("home", {
      user: userData, // This will be undefined if there's no user_id in the session
      brand: brandData,
      category: categoryData,
      product: productData,
      cart: cart,
      banner: bannerData,
    });
  } catch (error) {
    console.log(error.message);
    // Handle the error appropriately, e.g., send an error response
    res.status(500).send("Internal Server Error");
  }
};



// logout
const userLogout = async (req, res) => {
  try {
    req.session.destroy();
    
    res.redirect("/");
   } catch (error) {console.log(error.message);
    throw new Error(error);
  }
};

// forget password code start

const forgetLoad = async (req, res) => {
  try {
    const categoryData = await Category.find().populate("offer").exec();
    const cart = await Cart.findOne({ user: req.session.user_id })
      .populate("products.productId")
      .exec();

    res.render("forget", { cart: cart, category: categoryData });
   } catch (error) {console.log(error.message);
    throw new Error(error);
  }
};

const forgetVerify = async (req, res) => {
  try {
    const email = req.body.email;
    const userData = await User.findOne({ email: email });
    const categoryData = await Category.find().populate("offer").exec();
    const cart = await Cart.findOne({ user: req.session.user_id })
      .populate("products.productId")
      .exec();

    if (userData) {
      if (userData.is_varified === 0) {
        res.render("forget", {
          message: "Please verify your mail.",
          cart: cart,
          category: categoryData,
        });
      } else {
        const randomString = randormstring.generate();
        const updatedData = await User.updateOne(
          { email: email },
          { $set: { token: randomString } }
        );
        sendResetPasswordMail(userData.name, userData.email, randomString);
        res.render("forget", {
          message: "Please check your mail to reset your password.",
          cart: cart,
          category: categoryData,
        });
      }
    } else {
      res.render("forget", {
        message: "User email is incorrect.",
        cart: cart,
        category: categoryData,
      });
    }
   } catch (error) {console.log(error.message);
    throw new Error(error);
  }
};

const forgetPasswordLoad = async (req, res) => {
  try {
    const token = req.query.token;
    const tokenData = await User.findOne({ token: token });
    const categoryData = await Category.find().populate("offer").exec();
    const cart = await Cart.findOne({ user: req.session.user_id })
      .populate("products.productId")
      .exec();

    if (tokenData) {
      res.render("forget-password", {
        user_id: tokenData._id,
        cart: cart,
        category: categoryData,
      });
    } else {
      res.render("404", {
        message: "Token is invalid.",
        cart: cart,
        category: categoryData,
      });
    }
   } catch (error) {console.log(error.message);
    throw new Error(error);
  }
};

const resetPassword = async (req, res) => {
  try {
    const password = req.body.password;
    const user_id = req.body.user_id;

    const secure_password = await securePassword(password);

    const udupatedData = await User.findByIdAndUpdate(
      { _id: user_id },
      { $set: { password: secure_password, token: "" } }
    );

    res.redirect("/");
   } catch (error) {console.log(error.message);
    throw new Error(error);
  }
};

//for verification send mail link

const verificationLoad = async (req, res) => {
  try {
    const categoryData = await Category.find().populate("offer").exec();
 const cart = await Cart.findOne({ user: req.session.user_id })
      .populate("products.productId")
      .exec();

    res.render("verification",{cart: cart,category: categoryData,});
   } catch (error) {console.log(error.message);
    throw new Error(error);
  }
};

const sentVerificationLink = async (req, res) => {
  try {
    const email = req.body.email;
    const userData = await User.findOne({ email: email });
    if (userData) {
      sendVerifyMail(userData.name, userData.email, userData._id);

      res.render("verification", {
        message: "Reset verification mail sent your mail id, please check.",
        cart: cart,
        category: categoryData,
      });
    } else {
      res.render("verification", {
        message: "This email is not exist.",
        cart: cart,
        category: categoryData,
      });
    }
   } catch (error) {console.log(error.message);
    throw new Error(error);
  }
};

const changePassword = async (req, res) => {
  try {
    const currentpd = req.body.currentpassword;
    console.log("currentpd :", currentpd);
    const newpd = req.body.newpassword;
    console.log("newpd :", newpd);
    const confirmpd = req.body.confirmpassword;
    console.log("confirmpd :", currentpd);
    const user = req.body.user_id;
    console.log("user_id :", user);

    const userData = await User.findOne({ _id: user });

    const oldpd = userData.password;

    if (userData) {
      const passwordMatch = await bcrypt.compare(currentpd, oldpd);

      if (passwordMatch) {
        if (newpd === confirmpd) {
          const secure = await securePassword(newpd);
          const store = await User.updateOne(
            { _id: user },
            { $set: { password: secure } }
          );
          console.log("all matched");
          res.json({
            success: true,
            message: "Password changed successfully.",
          });
        } else {
          console.log("new and confirm not matched");
          res.json({
            success: false,
            message: "New and Confirm Password do not match.",
          });
        }
      } else {
        console.log("old and current not matched");
        res.json({ success: false, message: "Current Password is incorrect." });
      }
    }
  } catch (error) {
    console.log(error);
    res.render("500");
  }
};

// shope start here
const shopLoad = async (req, res) => {
  try {
    let userData;

    if (req.session.user_id) {
      userData = await User.findById(req.session.user_id);
    }

    const categoryData = await Category.find().populate("offer").exec();
    const cart = await Cart.findOne({ user: req.session.user_id })
      .populate("products.productId")
      .exec();

    const brandData = await Brand.find({});
    const categoryData1 = await Category.find().populate("offer").exec();

    let page = 1;
    if (req.query.page) {
      page = req.query.page;
    }

    let limit = 12; // Number of products per page

    let sortValue = -1;
    if (req.query.sortValue) {
      if (req.query.sortValue === "2") {
        sortValue = 1;
      } else if (req.query.sortValue === "1") {
        sortValue = -1;
      } else {
        sortValue = -1;
      }
    }

    let minPrice = 1;
    let maxPrice = 20000;

    if (req.query.minPrice) {
      minPrice = req.query.minPrice;
    }
    if (req.query.maxPrice) {
      maxPrice = req.query.maxPrice;
    }

    let search = "";

    if (req.query.search) {
      search = req.query.search;
    }

    async function getCategoryIds(search) {
      const categories = await Category.find({
        categoryName: { $regex: ".*" + search + ".*", $options: "i" },
      });
      return categories.map((category) => category._id);
    }

    async function getBrandIds(search) {
      const brands = await Brand.find({
        brandName: { $regex: ".*" + search + ".*", $options: "i" },
      });
      return brands.map((brand) => brand._id);
    }

    const query = {
      is_block: true,
      $or: [{ productName: { $regex: ".*" + search + ".*", $options: "i" } }],
      price: { $gte: minPrice, $lte: maxPrice },
    };

    if (req.query.search) {
      search = req.query.search;
      query.$or.push({
        Category: { $in: await getCategoryIds(search) },
        brand: { $in: await getBrandIds(search) },
      });
    }

    if (req.query.category) {
      query.category = req.query.category;
    }

    if (req.query.brand) {
      query.brand = req.query.brand;
    }

    let products;

    if (req.query.sortValue && req.query.sortValue != 3) {
      products = await Product.find(query)
        .populate("brand category offer")
        .populate({
          path: "category",
          populate: {
            path: "offer",
          },
        })
        .sort({ price: sortValue })
        .limit(limit * 1)
        .skip((page - 1) * limit);
    } else {
      products = await Product.find(query)
        .populate("brand category offer")
        .populate({
          path: "category",
          populate: {
            path: "offer",
          },
        })
        .sort({ createdAt: sortValue })
        .limit(limit * 1)
        .skip((page - 1) * limit);
    }

    const userId = req.session.user_id;
    const categoryDetails = await Category.find({});
    const brandDetails = await Brand.find({});
    const totalProducts = await Product.countDocuments({ is_block: true });
    let pageCount = Math.ceil(totalProducts / limit);

    res.render("shop", {
      categoryList: categoryData,
      brandList: brandData,
      catData: categoryDetails,
      brandData: brandDetails,
      product: products,
      currentPage: page,
      pageCount,
      user: userId,
      userData,
      brand: req.query.brand,
      sortValue: req.query.sortValue,
      minPrice: req.query.minPrice,
      maxPrice: req.query.maxPrice,
      search: req.query.search,
      category: req.query.category,
      cart: cart,
    });
  } catch (error) {
    console.log(error);
    // Handle the error appropriately, e.g., send an error response
    res.status(500).send("Internal Server Error");
  }
};


//wishList
const wishListLoad = async (req, res) => {
  try {
    const userData = await User.findById(req.session.user_id);
    const brandData = await Brand.find();
    const categoryData = await Category.find().populate("offer").exec();
    const cart = await Cart.findOne({ user: req.session.user_id })
      .populate("products.productId")
      .exec();

    const productData = await Product.find({ is_block: true })
      .populate("category brand")
      .exec();

    res.render("shop", {
      user: userData,
      brand: brandData,
      category: categoryData,
      cart: cart,
    });
   } catch (error) {console.log(error.message);
    throw new Error(error);
  }
};
//singleProductLoad
const singleProductLoad = async (req, res) => {
  try {
    let userData;

    if (req.session.user_id) {
      userData = await User.findById(req.session.user_id);
    }

    const { id } = req.params;
    const brandData = await Brand.find();
    const categoryData = await Category.find().populate("offer").exec();
    const cart = await Cart.findOne({ user: req.session.user_id })
      .populate("products.productId")
      .exec();

    const findProduct = await Product.findById(id)
      .populate("brand category offer")
      .populate({
        path: "category",
        populate: {
          path: "offer",
        },
      })
      .exec();

    const productData = await Product.find({ is_block: true })
      .populate("category brand offer")
      .exec();

    res.render("singleProduct", {
      user: userData,
      brand: brandData,
      category: categoryData,
      cart: cart,
      product: productData,
      currProduct: findProduct,
    });
  } catch (error) {
    console.log(error.message);
    // Handle the error appropriately, e.g., send an error response
    res.status(500).send("Internal Server Error");
  }
};


//user profile Load

const editLoad = async (req, res) => {
  try {
    const id = req.query.id;

    const userData = await User.findById({ _id: id });
    const userAddress = await Address.find({ userId: id });
    const coupons = await couponDb.find({ status: true });
    const categoryData = await Category.find().populate("offer").exec();
    const cart = await Cart.findOne({ user: req.session.user_id })
      .populate("products.productId")
      .exec();


    console.log("User Data:", userData);

    let referralHistory = []; // Initialize referralHistory here

    if (userData.walletHistory) {
      console.log("All Wallet History:", userData.walletHistory);

      referralHistory = userData.walletHistory.filter(
        (entry) =>
          entry.transactionDetails.startsWith("Referred") ||
          entry.transactionDetails.startsWith("Welcome")
      );

      console.log("Referral History:", referralHistory);
    } else {
      console.log("User not found or no wallet history");
    }

    if (userData) {
      res.render("edit", {
        user: userData,
        address: userAddress,
        coupons: coupons,
        referralHistory: referralHistory,
        category: categoryData,
        cart: cart,
      });
    } else {
      res.redirect("/home");
    }
  } catch (error) {
    console.log(error.message);
    throw new Error(error);
  }

};

// Update the controller to return the updated user data
const updateProfile = async (req, res) => {
  try {
    const userId = req.session.user_id;
    let updateData = {
      name: req.body.name,
      mobile: req.body.mno,
    };

    if (req.file) {
      updateData.image = req.file.filename;
    }

    // Use findByIdAndUpdate with the { new: true } option to return the updated user data
    const userData = await User.findByIdAndUpdate(
      { _id: userId },
      { $set: updateData },
      { new: true }
    );

    res.json({
      success: true,
      message: "Profile updated successfully.",
      user: userData, // Include the updated user data in the response
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};


// address Add

const addAddress = async (req, res) => {
  try {
    const userId = req.session.user_id; // Access userId from session

    let userAddress = await Address.findOne({ userId });

    if (!userAddress) {
      userAddress = new Address({
        userId,
        addresses: [
          {
            fullName: req.body.fullName,
            mobile: req.body.mobile,
            country: req.body.country,
            city: req.body.city,
            state: req.body.state,
            pincode: req.body.pincode,
          },
        ],
      });
    } else {
      userAddress.addresses.push({
        fullName: req.body.fullName,
        mobile: req.body.mobile,
        country: req.body.country,
        city: req.body.city,
        state: req.body.state,
        pincode: req.body.pincode,
      });
    }

    let result = await userAddress.save();
    res.redirect(`/edit?id=${req.session.user_id}`);
   } catch (error) {console.log(error.message);
    throw new Error(error);
  }
};

// Address update

const updateUserAddress = async (req, res) => {
  try {
    const addressId = req.body.id;
    const userId = req.session.user_id;
    console.log(userId);
    console.log(req.body.mobile);

    const pushAddress = await Address.updateOne(
      { userId: userId, "addresses._id": addressId },
      {
        $set: {
          "addresses.$.fullName": req.body.fullName,
          "addresses.$.mobile": req.body.mobile,
          "addresses.$.country": req.body.country,
          "addresses.$.city": req.body.city,
          "addresses.$.state": req.body.state,
          "addresses.$.pincode": req.body.pincode,
        },
      }
    );
    res.redirect(`/edit?id=${req.session.user_id}`);
  } catch (error) {
    console.error("Error updating address:", error);
    res.status(500).send("Internal Server Error");
  }
};

// deleteUserAddress

const deleteUserAddress = async (req, res) => {
  try {
    const id = req.body.id;
    console.log(id);
    const userId = req.session.user_id;
    console.log(userId);
    const deleteAddress = await Address.updateOne(
      { userId: userId },
      { $pull: { addresses: { _id: id } } }
    );
    console.log(deleteAddress);

    res.redirect(`/edit?id=${req.session.user_id}`);
  } catch (error) {
    console.log(error);
  }
};

const postVerifyWalletPayment = async (req, res) => {
  try {
    const userId = req.session.user_id;

    const details = req.body;
    const amount = parseInt(details.order.amount) / 100;
    let hmac = crypto.createHmac("sha256", process.env.KEY_SECRET);

    hmac.update(
      details.payment.razorpay_order_id +
        "|" +
        details.payment.razorpay_payment_id
    );
    hmac = hmac.digest("hex");
    if (hmac == details.payment.razorpay_signature) {
      const walletHistory = {
        transactionDate: new Date(),
        transactionDetails: "Deposited via Razorpay",
        transactionType: "Credit",
        transactionAmount: amount,
        currentBalance: !isNaN(userId.wallet) ? userId.wallet + amount : amount,
      };
      await User.findByIdAndUpdate(
        { _id: userId },
        {
          $inc: {
            wallet: amount,
          },
          $push: {
            walletHistory,
          },
        }
      );
      res.json({ status: true });
    } else {
      res.json({ status: false });
    }
  } catch (error) {
    console.log(error);
    res.render("500");
  }
};

const postAddMoneyToWallet = async (req, res) => {
  try {
    const { amount } = req.body;
    const id = crypto.randomBytes(8).toString("hex");

    var options = {
      amount: amount * 100,
      currency: "INR",
      receipt: "hello" + id,
    };

    instance.orders.create(options, (err, order) => {
      if (err) {
        res.json({ status: false });
      } else {
        res.json({ status: true, payment: order });
      }
    });
  } catch (error) {
    console.log(error);
    res.render("500");
  }
};
module.exports = {
  loadRegister,
  insertUser,
  verifyMail,
  loginLoad,
  verifyLogin,
  loadHome,
  userLogout,
  forgetLoad,
  forgetVerify,
  forgetPasswordLoad,
  resetPassword,
  verificationLoad,
  sentVerificationLink,
  editLoad,
  updateProfile,
  changePassword,
  shopLoad,
  wishListLoad,
  singleProductLoad,
  addAddress,
  updateUserAddress,
  deleteUserAddress,
  postVerifyWalletPayment,
  postAddMoneyToWallet,
};
