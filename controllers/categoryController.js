const Category = require('../models/categoryModel');
const offerDb = require("../models/offerModel");
const ProductDb = require("../models/productModel");
const mongoose = require("mongoose");


const categoryDashboard = async(req,res) => {

   try {
     const categoryData = await Category.find().populate("offer");
     const availableOffers = await offerDb.find({
       status: true,
       expiryDate: { $gte: new Date() },
     });
     res.render("categoryDashboard", {
       category: categoryData,
       availableOffers,
     });
   } catch (error) {
     console.log(error.message);
     throw new Error(error);
   }
 
 };
 
//* Add New category Load

const newCategoryLoad = async(req,res)=>{
   try {
     res.render("new-category");
   } catch (error) {
     console.log(error.message);
     throw new Error(error);
   }
}
//* Add New category
const addCategory = async (req, res) => {
  try {
    
    const categoryName = req.body.categoryName;
    const specification = req.body.specification;
    const coverPic=req.file.filename;
    const existingCategory = await Category.findOne({ categoryName: categoryName });

    if (existingCategory) {
      return res.render('new-category', { message: "Category already exists." });
    }
    const newCategory = new Category({
      categoryName: categoryName,
      specification: specification,
      coverPic:coverPic,
    });
    const categoryData = await newCategory.save();
    if (categoryData) {
      res.redirect('/admin/categoryDashboard');
    } else {
      res.render('new-category', { message: 'Something went wrong.' });
    }
  } catch (error) {console.log(error.message);
    throw new Error(error);
    res.status(500).send('Server Error');
  }
};


// edit category functionality

 const editCategoryLoad = async(req,res)=>{

   try {
     const id = req.query.id;
     const categoryData = await Category.findById({ _id: id });
     if (categoryData) {
       res.render("edit-category", { category: categoryData });
     } else {
       res.redirect("/admin/categoryDashboard");
     }
   } catch (error) {
     console.log(error.message);
     throw new Error(error);
   }

}

const updateCategory = async(req,res)=>{
  try {
    if (req.file) {
      const categoryData = await Category.findByIdAndUpdate(
        { _id: req.body.id },
        {
          $set: {
            categoryName: req.body.categoryName,
            specification: req.body.specification,
            coverPic: req.file.filename,
            is_block: req.body.is_block,
          },
        }
      );
    } else {
      const categoryData = await Category.findByIdAndUpdate(
        { _id: req.body.id },
        {
          $set: {
            categoryName: req.body.categoryName,
            specification: req.body.specification,
            is_block: req.body.is_block,
          },
        }
      );
    }
    res.redirect("/admin/categoryDashboard");
  } catch (error) {
    console.log(error.message);
    throw new Error(error);
  }
}



const applyCategoryOffer = async (req, res) => {
  try {
    const { categoryId, offerId } = req.body;

  
    const offer = await offerDb.findOne({ _id: offerId })
      

    if (!offer) {
      return res
        .status(404)
        .json({ success: false, message: "Offer not found" });
    }

   
    const updatedCategory = await Category.findOneAndUpdate(
      { _id: categoryId },
      { $set: { offer: offerId } },
      { new: true, lean: true }
    );

    if (!updatedCategory) {
      return res
        .status(404)
        .json({ success: false, message: "Category not found" });
    }

 
    const productsToUpdate = await ProductDb.find({ category: categoryId });



   
  
const updatedProduct = await ProductDb.updateMany(
  { category: categoryId },
  [
    {
      $set: {
        categoryOffer: mongoose.Types.ObjectId(offerId), // Convert offerId to ObjectId
        categoryDiscountedPrice: {
          $toInt: {
            $subtract: [
              "$price",
              {
                $divide: [{ $multiply: ["$price", offer.percentage] }, 100],
              },
            ],
          },
        },
      },
    },
  ],
  { new: true, lean: true }
);

    console.log("Updated Products:", updatedProduct);

    return res.status(200).json({ success: true, data: updatedCategory });
  } catch (error)
   {
     res.status(500).json({ success: false, message: "Internal Server Error" });
    console.log(error.message);
    throw new Error(error);
  
   
    
  }
};





// ==========================================================remove the product offer admin side===============================================================
const removeCategoryOffer = async (req, res) => {
  try {
    const { categoryId } = req.body;

    const category = await Category.findOne({ _id: categoryId });

    if (!category) {
      return res
        .status(404)
        .json({ success: false, message: "Category not found" });
    }

    // Check if the 'offer' field exists before attempting to remove it
    if (category.offer) {
      const updateCategory = await Category.updateOne(
        { _id: categoryId },
        {
          $unset: {
            offer: "",
          },
        }
      );

      const updateProducts = await ProductDb.updateMany(
        { category: categoryId },
        {
          $unset: {
            categoryDiscountedPrice: "",
            categoryOffer: "",
          },
        }
      );

      return res.json({
        success: true,
        data: { updateCategory, updateProducts },
      });
    } else {
      return res.json({
        success: false,
        message: "Offer field does not exist in the category",
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
    throw new Error(error);
  }
};




module.exports = {
  categoryDashboard,
  newCategoryLoad,
  addCategory,
  editCategoryLoad,
  updateCategory,
  applyCategoryOffer,
  removeCategoryOffer,
};