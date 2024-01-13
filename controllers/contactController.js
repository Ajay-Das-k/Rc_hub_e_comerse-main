const User = require("../models/userModel");
const Product = require("../models/productModel");
const Brand = require("../models/brandModel");
const Category = require("../models/categoryModel");
const Contact = require("../models/contactModel");
const Cart = require("../models/cart");
//contact
const contactLoad = async (req, res) => {
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

    res.render("contact", {
      user: userData,
      brand: brandData,
      category: categoryData,
      cart: cart,

      product: productData,
    });
   } catch (error) {console.log(error.message);
    throw new Error(error);
  }
};

const newContact = async (req, res) => {
  try {
    const clientName = req.body.name;
    const email = req.body.email;
    const subject = req.body.subject;
    const message = req.body.message;

    const contact = new Contact({
      clientName : clientName,
      email :email,
      subject :subject,
      message : message,
    });

    const contactData = await contact.save();

    if (contactData) {
      // console.log("all matched");
      res.json({
        success: true,
        message: "Thank you for contacting ! we will get touch with you.",
      });
    } else {
      console.log("ERROR");
      res.json({
        success: false,
        message: "Sorry some errors !.",
      });
    }
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server Error");
  }
};

module.exports = { contactLoad, newContact };
