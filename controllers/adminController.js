const User = require("../models/userModel");
const orderDb = require("../models/orderModel");
const categoryDb = require("../models/categoryModel");
const productDb = require("../models/productModel");
const { findIncome,countSales, findSalesData,findSalesDataOfYear, findSalesDataOfMonth, formatNum,} = require("../helpers/orderHelper");

const bcrypt = require("bcryptjs");
const randomstring = require("randomstring");
const config = require("../config/config");
const nodemailer = require("nodemailer");

const securePassword = async (password) => {
  try {
    const passwordHash = await bcrypt.hash(password, 10);
    return passwordHash;
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
        ', please click here to <a href="https://rc-hub-ecomerse.onrender.com/admin/forget-password?token=' +
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
//for send mail
const addUserMail = async (name, email, password, user_id) => {
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
      subject: "Admin add you and Verify your mail",
      html:
        "<p>Hii " +
        name +
        ', please click here to <a href="https://rc-hub-ecomerse.onrender.com/verify?id=' +
        user_id +
        '"> Verify </a> your mail.</p> <br><br> <b>Email:-</b>' +
        email +
        "<br><b>Password:-</b>" +
        password +
        "",
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

const loadLogin = async (req, res) => {
  try {
    res.render("login");
   } catch (error) {console.log(error.message);
    throw new Error(error);
  }
};

const verifyLogin = async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;

    const userData = await User.findOne({ email: email });
    if (userData) {
      const passwordMatch = await bcrypt.compare(password, userData.password);

      if (passwordMatch) {
        if (userData.is_admin === 0) {
          res.render("login", { message: "Email and password is incorrect" });
        } else {
          req.session.user_id = userData._id;
          res.redirect("/admin/home");
        }
      } else {
        res.render("login", { message: "Email and password is incorrect" });
      }
    } else {
      res.render("login", { message: "Email and password is incorrect" });
    }
   } catch (error) {console.log(error.message);
    throw new Error(error);
  }
};
// +++++++++++++++++++++++++++++++++++Admin dash board
const loadDashboard = async (req, res) => {
  try {
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const firstDayOfPreviousMonth = new Date(
      today.getFullYear(),
      today.getMonth() - 1,
      1
    );
    const jan1OfTheYear = new Date(today.getFullYear(), 0, 1);

    const totalIncome = await findIncome();
    const thisMonthIncome = await findIncome(firstDayOfMonth);
    const thisYearIncome = await findIncome(jan1OfTheYear);

    const totalUsersCount = formatNum(await User.find({}).count());
    const usersOntheMonth = formatNum(
      await User.find({ updatedAt: { $gte: firstDayOfMonth } }).count()
    );

    const totalSalesCount = formatNum(await countSales());
    const salesOnTheYear = formatNum(await countSales(jan1OfTheYear));
    const salesOnTheMonth = formatNum(await countSales(firstDayOfMonth));
    const salesOnPrevMonth = formatNum(
      await countSales(firstDayOfPreviousMonth, firstDayOfPreviousMonth)
    );

    let salesYear = 2023;
    if (req.query.salesYear) {
      salesYear = parseInt(req.query.salesYear);
    }

    if (req.query.year) {
      salesYear = parseInt(req.query.year);
      displayValue = req.query.year;
      xDisplayValue = "Months";
    }

    let monthName = "";
    if (req.query.month) {
      salesMonth = "Weeks";
      monthName = getMonthName(req.query.month);
      displayValue = `${salesYear} - ${monthName}`;
    }

    const totalYears = await orderDb.aggregate([
      {
        $group: {
          _id: {
            createdAt: { $dateToString: { format: "%Y", date: "$createdAt" } },
          },
        },
      },
      { $sort: { "_id:createdAt": -1 } },
    ]);

    const displayYears = [];

    totalYears.forEach((year) => {
      displayYears.push(year._id.createdAt);
    });

    let orderData;

    if (req.query.year && req.query.month) {
      orderData = await findSalesDataOfMonth(salesYear, req.query.month);
    } else if (req.query.year && !req.query.month) {
      orderData = await findSalesDataOfYear(salesYear);
    } else {
      orderData = await findSalesData();
    }

    let months = [];
    let sales = [];

    if (req.query.year && req.query.month) {
      orderData.forEach((year) => {
        months.push(`Week ${year._id.weekNumber}`);
      });
      orderData.forEach((sale) => {
        sales.push(Math.round(sale.sales));
      });
    } else if (req.query.year && !req.query.month) {
      orderData.forEach((month) => {
        months.push(getMonthName(month._id.createdAt));
      });
      orderData.forEach((sale) => {
        sales.push(Math.round(sale.sales));
      });
    } else {
      orderData.forEach((year) => {
        months.push(year._id.createdAt);
      });
      orderData.forEach((sale) => {
        sales.push(Math.round(sale.sales));
      });
    }

    let totalSales = sales.reduce((acc, curr) => (acc += curr), 0);

    let categories = [];
    let categorySales = [];

    const categoryData = await orderDb.aggregate([
      { $match: { "products.OrderStatus": "Delivered" } },
      { $unwind: "$products" },
      {
        $lookup: {
          from: "products",
          localField: "products.productId",
          foreignField: "_id",
          as: "populatedProduct",
        },
      },
      {
        $unwind: "$populatedProduct",
      },
      {
        $lookup: {
          from: "categories",
          localField: "populatedProduct.category",
          foreignField: "_id",
          as: "populatedCategory",
        },
      },
      {
        $unwind: "$populatedCategory",
      },
      {
        $group: {
          _id: "$populatedCategory.categoryName",
          sales: { $sum: "$totalAmount" },
        },
      },
    ]);

    categoryData.forEach((cat) => {
      categories.push(cat._id), categorySales.push(cat.sales);
    });

    // aggregation to take the payment data
    let paymentData = await orderDb.aggregate([
      {
        $unwind: "$products",
      },
      {
        $match: {
          $or: [
            { "products.OrderStatus": "Delivered" },
            { paymentStatus: "success" },
          ],
          paymentMethod: { $exists: true },
        },
      },
      {
        $group: {
          _id: "$paymentMethod",
          count: { $sum: 1 },
        },
      },
    ]);

    let paymentMethods = [];
    let paymentCount = [];

    paymentData.forEach((data) => {
      paymentMethods.push(data._id);
      paymentCount.push(data.count);
    });

    let orderDataToDownload = await orderDb
      .find({ "products.OrderStatus": "Delivered" })
      .sort({ createdAt: 1 })
      .populate("products.productId");
    if (req.query.fromDate && req.query.toDate) {
      const { fromDate, toDate } = req.query;
      orderDataToDownload = await orderDb
        .find({
          "products.OrderStatus": "Delivered",
          createdAt: { $gte: fromDate, $lte: toDate },
        })
        .sort({ createdAt: 1 });
    }
     const userData = await User.findById({ _id: req.session.user_id });

    res.render("home", {
      admin: userData,
      totalUsersCount,
      usersOntheMonth,
      totalSalesCount,
      salesOnTheYear,
      totalIncome,
      thisMonthIncome,
      thisYearIncome,
      salesOnTheMonth,
      salesOnPrevMonth,
      salesYear,
      displayYears,
      totalSales,
      months,
      sales,
      categories,
      categorySales,
      paymentMethods,
      paymentCount,
      orderDataToDownload,
    });
  } catch (error) {
    console.log(error);
    res.render("admin500");
  }
};

function getMonthName(monthNumber) {
  if (typeof monthNumber === "string") {
    monthNumber = parseInt(monthNumber);
  }

  if (monthNumber < 1 || monthNumber > 12) {
    return "Invalid month number";
  }

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  return monthNames[monthNumber - 1];
}




// +++++++++++++++++++++++++++++++++++++++++++++++++++++++++Admin Dash board

const logout = async (req, res) => {
  try {
    req.session.destroy();
    res.redirect("/admin");
   } catch (error) {console.log(error.message);
    throw new Error(error);
  }
};
const forgetLoad = async (req, res) => {
  try {
    res.render("adminForget");
   } catch (error) {console.log(error.message);
    throw new Error(error);
  }
};

const forgetVerify = async (req, res) => {
  try {
    const email = req.body.email;
    const userData = await User.findOne({ email: email });
    if (userData) {
      if (userData.is_admin === 0) {
        res.render("adminForget", { message: "Email is incorrect" });
      } else {
        const randomString = randomstring.generate();
        const updatedData = await User.updateOne(
          { email: email },
          { $set: { token: randomString } }
        );
        sendResetPasswordMail(userData.name, userData.email, randomString);
        res.render("adminForget", {
          message: "Please check your mail to reset your password.",
        });
      }
    } else {
      res.render("adminForget", { message: "Email is incorrect" });
    }
   } catch (error) {console.log(error.message);
    throw new Error(error);
  }
};

const forgetPasswordLoad = async (req, res) => {
  try {
    const token = req.query.token;

    const tokenData = await User.findOne({ token: token });
    if (tokenData) {
      res.render("forget-password", { user_id: tokenData._id });
    } else {
      res.render("404", { message: "Invalid Link" });
    }
   } catch (error) {console.log(error.message);
    throw new Error(error);
  }
};

const resetPassword = async (req, res) => {
  try {
    const password = req.body.password;
    const user_id = req.body.user_id;

    const securePass = await securePassword(password);

    const updatedData = await User.findByIdAndUpdate(
      { _id: user_id },
      { $set: { password: securePass, token: "" } }
    );

    res.redirect("/admin");
   } catch (error) {console.log(error.message);
    throw new Error(error);
  }
};

const adminDashboard = async (req, res) => {
  try {
    var search = ""; //<----this is where we search for the users in dashboard
    if (req.query.search) {
      search = req.query.search;
    }

    var page = 1;
    if (req.query.page) {
      page = req.query.page;
    }

    const limit = 1000; ///<----PAGINATION------------>//

    const userData = await User.find({
      is_admin: 0,
      $or: [
        { name: { $regex: ".*" + search + ".*", $options: "i" } }, // Case-insensitive search
        { email: { $regex: ".*" + search + ".*", $options: "i" } },
        { mobile: { $regex: ".*" + search + ".*", $options: "i" } },
      ],
    })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const count = await User.find({
      is_admin: 0,
      $or: [
        { name: { $regex: ".*" + search + ".*", $options: "i" } }, // Case-insensitive search
        { email: { $regex: ".*" + search + ".*", $options: "i" } },
        { mobile: { $regex: ".*" + search + ".*", $options: "i" } },
      ],
    }).countDocuments();
    const usersData = await User.find({ is_admin: 0 });
    //   console.log(userData);
    res.render("user", {
      userCount: count,
      users: userData,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
    });
   } catch (error) {console.log(error.message);
    throw new Error(error);
  }
};

//* Add New Work start

const newUserLoad = async (req, res) => {
  try {
    res.render("new-user");
   } catch (error) {console.log(error.message);
    throw new Error(error);
  }
};

const addUser = async (req, res) => {
  try {
    const name = req.body.name;
    const email = req.body.email;
    const mno = req.body.mno;
    const image = req.file.filename;
    const password = randomstring.generate(8);

    const spassword = await securePassword(password);

    const user = new User({
      name: name,
      email: email,
      mobile: mno,
      image: image,
      password: spassword,
      is_admin: 0,
    });

    const userData = await user.save();

    if (userData) {
      addUserMail(name, email, password, userData._id);
      res.redirect("/admin/dashboard");
    } else {
      res.render("new-user", { message: "Something wrong." });
    }
   } catch (error) {console.log(error.message);
    throw new Error(error);
  }
};

//edit user functionality

const editUserLoad = async (req, res) => {
  try {
    const id = req.query.id;
    const userData = await User.findById({ _id: id });
    if (userData) {
      res.render("edit-user", { user: userData });
    } else {
      res.redirect("/admin/dashboard");
    }
   } catch (error) {console.log(error.message);
    throw new Error(error);
  }
};

const updateUsers = async (req, res) => {
  try {
    const userData = await User.findByIdAndUpdate(
      { _id: req.body.id },
      {
        $set: {
          name: req.body.name,
          email: req.body.email,
          mobile: req.body.mno,
          is_varified: req.body.verify,
          is_block: req.body.block,
        },
      }
    );

    res.redirect("/admin/dashboard");
   } catch (error) {console.log(error.message);
    throw new Error(error);
  }
};

//delete users
const deleteUser = async (req, res) => {
  try {
    const id = req.query.id;
    await User.deleteOne({ _id: id });
    res.redirect("/admin/dashboard");
   } catch (error) {console.log(error.message);
    throw new Error(error);
  }
};
// orders load

const orderDashboard = async (req, res) => {
  try {
    const orders = await orderDb.find();

    const productWiseOrdersArray = [];

    for (const order of orders) {
      for (const productInfo of order.products) {
        const productId = productInfo.productId;

        const product = await productDb
          .findById(productId)
          .select("productName images price");
          // console.log(productInfo,"___________________________________")
        const userDetails = await User.findById(order.userId).select("email");

        if (product) {
          // Push the order details with product details into the array
          productWiseOrdersArray.push({
            user: userDetails,
            product: product,
            orderDetails: {
              _id: order._id,
              trackingNum:order.uniqueId,
              userId: order.userId,
              deliveryDetails: order.deliveryDetails,
              date: order.date,
              totalAmount: productInfo.quantity * productInfo.productSalePrice,
              OrderStatus: productInfo.OrderStatus,
              StatusLevel: productInfo.statusLevel,
              paymentStatus: productInfo.paymentStatus,
              paymentMethod: order.paymentMethod,
              quantity: productInfo.quantity,
              productName:product.productName
            },
          });
        }
      }
    }

    res.render("orderDashboard", { orders: productWiseOrdersArray });
   } catch (error) {console.log(error.message);
    throw new Error(error);
  }
};

const adminOrderFullDetails = async (req, res) => {
  try {
    const { orderId, productId } = req.query;

    const order = await orderDb.findById(orderId);
    const productInfo = order.products.find(
      (product) => product.productId.toString() === productId
    );
    const product = await productDb
      .findById(productId)
      .select("productName coverPic price");

    const productOrder = {
      orderId: order._id,
      product: product,
      orderDetails: {
        _id: order._id,
        userId: order.userId,
        deliveryDetails: order.deliveryDetails,
        date: order.date,
        totalAmount: order.totalAmount,
        OrderStatus: productInfo.OrderStatus,
        StatusLevel: productInfo.statusLevel,
        paymentMethod: order.paymentMethod,
        paymentStatus: productInfo.paymentStatus,
        quantity: productInfo.quantity,
        productSalePrice: productInfo.productSalePrice,
      },
    };

    res.render("orderFullDetails", {
      product: productOrder,
      orderId,
      productId,
    });
   } catch (error) {console.log(error.message);
    throw new Error(error);
  }
};

const changeOrderStatus = async (req, res) => {
  try {
    const { status, orderId, productId } = req.body;
    const order = await orderDb.findById(orderId);
    // find status level
    const statusMap = {
      Shipped: 2,
      OutforDelivery: 3,
      Delivered: 4,
    };
    const selectedStatus = status;
    const statusLevel = statusMap[selectedStatus];

    if (!order) {
      return res.status(404).json({ message: "Order not found." });
    }
    const productInfo = order.products.find(
      (product) => product.productId.toString() === productId
    );
    // console.log(productInfo);
    productInfo.OrderStatus = status;
    productInfo.statusLevel = statusLevel;
    productInfo.updatedAt = Date.now();
    const result = await order.save();
    // console.log(result);
    res.redirect(
      `/admin/orderFullDetails?orderId=${orderId}&productId=${productId}`
    );
   } catch (error) {console.log(error.message);
    throw new Error(error);
  }
};
const adminCancelOrder = async (req, res) => {
  try {
    const { orderId, productId } = req.body;

    const order = await orderDb.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: "Order not found." });
    }

    const productInfo = order.products.find(
      (product) => product.productId.toString() === productId
    );

    if (productInfo) {
      productInfo.OrderStatus = "Cancelled";
      productInfo.updatedAt = Date.now();

      await order.save();

      res.redirect(
        `/admin/orderFullDetails?orderId=${orderId}&productId=${productId}`
      );
    } else {
      return res
        .status(404)
        .json({ message: "Product not found in the order." });
    }
   } catch (error)
    {console.log(error.message);
    throw new Error(error);
    return res.status(500).json({ error: "An error occurred" });
  }
};


const chatScreen = async (req, res) => {
  try {
    res.render("chatScreen");
  } catch (error) {
    console.log(error.message);
    throw new Error(error);
  }
};

module.exports = {
  loadLogin,
  verifyLogin,
  loadDashboard,
  logout,
  forgetLoad,
  forgetVerify,
  forgetPasswordLoad,
  resetPassword,
  adminDashboard,
  newUserLoad,
  addUser,
  editUserLoad,
  updateUsers,
  deleteUser,
  orderDashboard,
  adminOrderFullDetails,
  changeOrderStatus,
  adminCancelOrder,
  chatScreen,
};
