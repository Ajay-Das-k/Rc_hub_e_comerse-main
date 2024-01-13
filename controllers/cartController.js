const cartDb = require("../models/cart");
const userDb = require("../models/userModel");
const productDb = require("../models/productModel");
const Category = require("../models/categoryModel");
const Brand = require("../models/brandModel");
const { ObjectId } = require("mongoose").Types;

const addToCart = async (req, res) => {
  try {
    if (req.session.user_id) {
      const productId = req.body.id;
      const name = req.session.user_id;
      const userData = await userDb.findOne({ _id: name });
      const userId = userData._id;
      const productData = await productDb.findById(productId);

      if (!productData) {
        return res.status(404).json({ error: "Product not found" });
      }

      const userCart = await cartDb.findOne({ user: userId });

      let productPrice = 0;

      if (productData.discountedPrice || productData.categoryDiscountedPrice) {
        // console.log("discountedPrice:", productData.discountedPrice);
        // console.log(
        //   "categoryDiscountedPrice:",
        //   productData.categoryDiscountedPrice
        // );

        productPrice =
          productData.discountedPrice < productData.categoryDiscountedPrice
            ? productData.discountedPrice
            : productData.categoryDiscountedPrice;

        // console.log("Selected productPrice:", productPrice);
      } else {
        productPrice = productData.price;
        // console.log("Using regular price:", productPrice);
      }

      if (userCart) {
        const productExist = await userCart.products.findIndex(
          (product) => product.productId == productId
        );

        if (productExist !== -1) {
          const cartData = await cartDb.findOne(
            { user: userId, "products.productId": productId },
            { "products.productId.$": 1, "products.quantity": 1 }
          );

          const [{ quantity }] = cartData.products;

          if (productData.quantity <= quantity) {
            return res.json({ outofstock: true });
          } else {
            await cartDb.findOneAndUpdate(
              { user: userId, "products.productId": productId },
              { $inc: { "products.$.quantity": 1 } }
            );
          }
        } else {
          await cartDb.findOneAndUpdate(
            { user: userId },
            {
              $push: {
                products: { productId: productId, price: productPrice },
              },
            }
          );
        }
      } else {
        const data = new cartDb({
          user: userId,
          products: [{ productId: productId, price: productPrice }],
        });
        await data.save();
      }

      res.json({ success: true });
    } else {
      res.json({ loginRequired: true });
    }
 } catch (error) {console.log(error.message);
    throw new Error(error);
    res.status(500).json({ error: "An error occurred" });
  }
};


const loadCart = async (req, res) => {
  try {
    const brandData = await Brand.find();
    const categoryData = await Category.find();
    const id = req.session.user_id;
    const userData = await userDb.findById({ _id: id });
    // console.log(userData);

    const userId = userData._id;

    const cartData = await cartDb
      .findOne({ user: userId })
      .populate("products.productId");
    if (req.session.user_id) {
      if (cartData) {
        let Total;
        if (cartData.products != 0) {
          const total = await cartDb.aggregate([
            {
              $match: { user: new ObjectId(userId) },
            },
            {
              $unwind: "$products",
            },
            {
              $project: {
                price: "$products.price",
                quantity: "$products.quantity",
              },
            },
            {
              $group: {
                _id: null,
                total: {
                  $sum: {
                    $multiply: ["$quantity", "$price"],
                  },
                },
              },
            },
          ]);
          Total = total[0].total;

          // console.log(Total);
          console.log(userId);

          res.render("cart", {
            user: userData,
            cart: cartData.products,
            userId: userId,
            total: Total,
            brand: brandData,
            category: categoryData,
          });
          console.log("case1");
        } else {
          res.render("cart", {
            user: req.session.user_id,
            cart: [],
            total: 0,
            brand: brandData,
            category: categoryData,
          });
          console.log("case2");
        }
      } else {
        res.render("cart", {
          user: userData,
          cart: [],
          total: 0,
          brand: brandData,
          category: categoryData,
        });
        console.log("case3");
      }
    } else {
      res.render("cart", {
        message: "User Logged",
        user: userData,
        cart: [],
        total: 0,
        brand: brandData,
        category: categoryData,
      });
      console.log("case4");
    }
  } catch (error) {
    console.log(error.message);
    throw new Error(error);
  }
};

const cartQuantity = async (req, res) => {
  try {
    const userId = req.session.user_id;
    const productId = req.body.product;
    const count = parseInt(req.body.count);

    const cartData = await cartDb.findOne(
      {
        user: new ObjectId(userId),
        "products.productId": new ObjectId(productId),
      },
      {
        "products.productId.$": 1,
        "products.quantity": 1,
      }
    );

    const [{ quantity }] = cartData.products;

    const stockAvailable = await productDb.findById({
      _id: new ObjectId(productId),
    });

    if (stockAvailable.quantity < quantity + count) {
      return res.json({ changeSuccess: false, message: "Insufficient stock" });
    }

    let productPrice = 0;

    if (
      stockAvailable.discountedPrice ||
      stockAvailable.categoryDiscountedPrice
    ) {
      productPrice =
        stockAvailable.discountedPrice > stockAvailable.categoryDiscountedPrice
          ? stockAvailable.discountedPrice
          : stockAvailable.categoryDiscountedPrice;
    } else {
      productPrice = stockAvailable.price;
    }



    await cartDb.updateOne(
      {
        user: userId,
        "products.productId": productId,
      },
      {
        $inc: { "products.$.quantity": count },
        $set: {
          "products.$.totalPrice": productPrice * (quantity + count),
        },
      }
    );

    res.json({ changeSuccess: true });
  } catch (error) {console.log(error.message);
    throw new Error(error);
  
    res.json({ changeSuccess: false, message: "An error occurred" });
  }
};

const removeProduct = async (req, res) => {
  try {
    const productId = req.body.product;

    const user = req.session.user_id;
    const userId = user._id;

    const cartData = await cartDb.findOneAndUpdate(
      { "products.productId": productId },
      {
        $pull: { products: { productId: productId } },
      }
    );
    res.json({ success: true });
  } catch (error) {
    console.log(error.message);
    throw new Error(error);
  }
};

module.exports = {
  addToCart,
  loadCart,
  cartQuantity,
  removeProduct,
};
