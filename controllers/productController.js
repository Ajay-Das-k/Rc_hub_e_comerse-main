const Product = require("../models/productModel");
const Category = require("../models/categoryModel");
const Brand = require("../models/brandModel");
const mongoose = require("mongoose");
const offerDb = require("../models/offerModel");





const productDashboard = async (req, res) => {
  try {
   const products = await Product.find()
  .populate('brand category offer')
  .populate({
    path: 'category',
    populate: {
      path: 'offer',
    },
  })
  .exec();
 
    const availableOffers = await offerDb.find({
      status: true,
      expiryDate: { $gte: new Date() },
    });

    res.render("productDashboard", {
      product: products,
      availableOffers,
       // Call the function to get a random color
    });
  } catch (error) {
    console.log(error.message);
    throw new Error(error);
  }
};

//* Add New Product

const newProductLoad = async (req, res) => {
  try {
    const categoryList = await Category.find();
    const brandList = await Brand.find();
    res.render("new-product", { category: categoryList, brand: brandList });
   } catch (error) {console.log(error.message);
    throw new Error(error);
  }
};

const addProduct = async (req, res) => {
  try {
    const productName = req.body.productName;
    const description = req.body.description;
    const category = req.body.category;
    const color = req.body.color;
    const price = req.body.price;
    const brand = req.body.brand;
    const quantity = req.body.quantity;

    const categoryData = await Category.findOne({ _id: category })
      .populate("offer")
      .exec();

    let categoryOffer = null;
    let discountedPrice = null;

    if (categoryData.offer) {
      categoryOffer = categoryData.offer;
      const originalPrice = parseFloat(price);
      discountedPrice =
        originalPrice - (originalPrice * categoryData.offer.percentage) / 100;
    }

    const coverPic = [];
    for (let i = 0; i < req.files.length; i++) {
      coverPic[i] = req.files[i].filename;
    }

    const productData = await Product.create({
      productName: productName,
      description: description,
      category: category,
      color: color,
      price: price,
      brand: brand,
      quantity: quantity,
      coverPic: coverPic,
      ...(categoryOffer && {
        categoryDiscountedPrice: discountedPrice,
        categoryOffer: categoryOffer,
      }),
    });

    if (productData) {
      res.redirect("/admin/productDashboard");
    } else {
      res.render("new-product", { message: "Something wrong." });
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).render("new-product", { message: "Internal Server Error" });
  }
};


// edit product load functionality

const editProductLoad = async (req, res) => {
  try {
    const id = req.query.id;
    const productData = await Product.findById({ _id: id })
      .populate("brand category")
      .exec();
    const categoryData = await Category.find();
    const brandData = await Brand.find();
    if (productData) {
      const images = productData.coverPic; // coverPic is the array
      res.render("edit-product", {
        product: productData,
        category: categoryData,
        brand: brandData,
      });
    } else {
      res.redirect("/admin/dashboard");
    }
   } catch (error) {console.log(error.message);
    throw new Error(error);
  }
};
// edit picture





// edit product

const updateProduct = async (req, res) => {
  try {
    const id = req.body.id;
    const productName = req.body.productName;
    const description = req.body.description;
    const category = req.body.category;
    const color = req.body.color;
    const price = req.body.price;
    const brand = req.body.brand;
    const quantity = req.body.quantity;
    const coverPic = [];

    for (let i = 0; i < req.files.length; i++) {
      coverPic[i] = req.files[i].filename;
    }

    let updateObject = {
      productName: productName,
      description: description,
      category: category,
      color: color,
      price: price,
      brand: brand,
      quantity: quantity,
      is_block: req.body.is_block,
      coverPic: coverPic,
    };

    if (req.files.length === 0) {
      // If no files were uploaded, remove the coverPic property from updateObject
      delete updateObject.coverPic;
    }

    console.log("Update Object:", updateObject);

    // Find the document first
    const product = await Product.findById(id);

    // Update the document with the new values
    Object.assign(product, updateObject);

    // Save the document
    const updatedProduct = await product.save();

    console.log("Updated Product Data:", updatedProduct);

    if (updatedProduct) {
      res.redirect("/admin/productDashboard");
    } else {
      res.render("editProduct", { message: "Something went wrong" });
    }
  } catch (error) {
    console.log(error);
    // Handle error response or rethrow the error if necessary
    res.status(500).send("Internal Server Error");
  }
};

// Remove Image
const removeImage = async (req, res) => {
  try {
    const productId = req.query.productId;
    const imageIndex = req.query.imageIndex;

    // Check if productId is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ error: "Invalid product ID" });
    }

    const product = await Product.findById(productId);
    if (!product || imageIndex < 0 || imageIndex >= product.coverPic.length) {
      return res.status(404).json({ error: "Invalid product or image index" });
    }

    // Move the image removal logic to a separate function
    removeImageAtIndex(product, imageIndex);

    // Save the updated product
    await product.save();

    res.json({ success: true, message: "Image removed successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }

};
// Separate function for removing an image at a specific index
const removeImageAtIndex = (product, index) => {
  product.coverPic.splice(index, 1);
};


// Upload Image

const uploadImage = async (req, res) => {
  try {
    const productId = req.params.productId;
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    // Assuming you have an array of images in your product model
    const coverPic = req.files.map((file) => file.filename);

    // Check if the number of images exceeds the limit (e.g., 10)
    if (product.coverPic.length + coverPic.length > 10) {
      // Send a success response with the message
      return res.json({
        success: true,
        message: "Maximum 10 images allowed",
        product: product,
      });
    }

    // Add the new filenames to the coverPic array
    product.coverPic = product.coverPic.concat(coverPic);

    // Save the updated product
    const updatedProduct = await product.save();

    // Send a success response with the updated product information
    res.json({
      success: true,
      message: "Image(s) uploaded successfully",
      product: updatedProduct,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// ==========================================================apply the product offer===============================================================

const applyProductOffer = async (req, res) => {
  try {
   

    const { offerId, productId } = req.body;


     const offer = await offerDb.findOne({ _id: offerId });

    if (!offer) {
      return res.json({ success: false, message: 'Offer not found' })
    }

    const product = await Product
      .findOne({ _id: productId })
      .populate('category')

    if (!product) {
      return res.json({ success: false, message: 'Product not found' })
    }

    // Get the category discount, if available
    const categoryDiscount =
      product.category && product.category.offer ? await offerDb.findOne({ _id: product.category.offer }): 0

    // Calculate real price and discounted price for the product
    const discountPercentage = offer.percentage
    const originalPrice = parseFloat(product.price)
    const discountedPrice =originalPrice - (originalPrice * discountPercentage) / 100

    // Check if category offer is available and its discount is greater than product offer
    if (categoryDiscount && categoryDiscount.percentage > discountPercentage) {
      return res.json({
        success: false,
        message: 'Category offer has greater discount'
      })
    }

    await Product.updateOne(
      { _id: productId },
      {
        $set: {
          offer: offerId,
          discountedPrice: discountedPrice
        }
      }
    )

    const updatedProduct = await Product
      .findOne({ _id: productId })
      .populate('offer')
    res.json({ success: true, data: updatedProduct })

  } catch (error) {
    console.log(error.message)
    res.render('500')
  }
}

// ==========================================================remove the product offer admin side===============================================================
const removeProductOffer = async (req, res) => {
  try {
    const { productId } = req.body;

    const remove = await Product.updateOne(
      { _id: productId },
      {
        $unset: {
          offer: "",
          discountedPrice: "",
          realPrice: "",
        },
      }
    );

    res.json({ success: true, data: remove });
  } catch (error) {
    console.log(error);
    res.render("500");
  }
};

module.exports = {
  productDashboard,
  newProductLoad,
  addProduct,
  editProductLoad,
  updateProduct,
  removeImage,
  uploadImage,
  applyProductOffer,
  removeProductOffer,
};
