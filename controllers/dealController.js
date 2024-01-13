const Product = require("../models/productModel");
const Category = require("../models/categoryModel");
const Deal = require("../models/brandModel");
const offerDb = require("../models/offerModel");

const dealDashboard = async (req, res) => {
  try {
   const dealData = await Deal.find();
    res.render("dealDashboard", {
      deal: dealData 
    });
  } catch (error) {
    console.log(error.message);
    throw new Error(error);
  }
};
//* Add New deal Load
const newDealLoad = async (req, res) => {
  try {
    res.render("new-deal");
  } catch (error) {
    console.log(error.message);
    throw new Error(error);
  }
};



//* Add New deal
const addDeal = async (req, res) => {
  try {
    console.log(req.body, "-----------------------------------");
    const dealName = req.body.dealName;
    const specification = req.body.specification;
    const coverPic = req.file.filename;
    const existingDeal = await Deal.findOne({ dealName: dealName });
    if (existingDeal) {
      return res.render("new-deal", { message: "Deal already exists." });
    }
    const deal = new Deal({
      dealName: dealName,
      specification: specification,
      coverPic: coverPic,
    });
    const dealData = await deal.save();
    if (dealData) {
      res.redirect("/admin/dealDashboard");
    } else {
      res.render("new-deal", { message: "Something went wrong." });
    }
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server Error");
  }
};

// edit deal functionality

const editDealLoad = async (req, res) => {
  try {
    const id = req.query.id;
    const dealData = await Deal.findById({ _id: id });
    if (dealData) {
      res.render("edit-deal", { deal: dealData });
    } else {
      res.redirect("/admin/dealDashboard");
    }
  } catch (error) {
    console.log(error.message);
    throw new Error(error);
  }
};

const updateDeal = async (req, res) => {
  try {
    if (req.file) {
      const dealData = await Deal.findByIdAndUpdate(
        { _id: req.body.id },
        {
          $set: {
            dealName: req.body.dealName,
            specification: req.body.specification,
            coverPic: req.file.filename,
            is_block: req.body.is_block,
          },
        }
      );
    } else {
      const dealData = await Deal.findByIdAndUpdate(
        { _id: req.body.id },
        {
          $set: {
            dealName: req.body.dealName,
            specification: req.body.specification,
            is_block: req.body.is_block,
          },
        }
      );
    }
    res.redirect("/admin/dealDashboard");
  } catch (error) {
    console.log(error.message);
    throw new Error(error);
  }
};

module.exports = {
  dealDashboard,
  newDealLoad,
  addDeal,
  editDealLoad,
  updateDeal,
};
