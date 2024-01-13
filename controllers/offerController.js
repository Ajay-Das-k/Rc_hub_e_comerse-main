const offerDb = require("../models/offerModel");
const Product = require("../models/productModel");
const Category = require("../models/categoryModel");

// ==================================================================load offer page in admin side ============================================

const loadOffer = async (req, res) => {
  try {
    const offers = await offerDb.find();
    res.render("offerDashboard", {
      offers: offers,
      now: new Date(),
    });
  } catch (error) {
    console.log(error.message);
    throw new Error(error);
  }
};

// ==================================================================load add offer page in admin side ============================================

const loadaddOffer = async (req, res) => {
  try {
    res.render("new-offer");
  } catch (error) {
    console.log(error.message);
    throw new Error(error);
  }
};

// ==================================================================load edit offer page in admin side ============================================

const loadEditOffer = async (req, res) => {
  try {
    const id = req.params.id;
    const offer = await offerDb.findOne({ _id: id });
    res.render("editOffer", {
      offer: offer,
    });
  } catch (error) {
    console.log(error.message);
    throw new Error(error);
  }
};

// ==================================================================post add offer offer page  ===================================================

const AddOffer = async (req, res) => {
  try {
    const { search, page } = req.query;
    const { startingDate, expiryDate, percentage } = req.body;
    const name = req.body.name.toUpperCase();

    // Check if startingDate is after expiryDate
    if (new Date(startingDate) > new Date(expiryDate)) {
      res.render("new-offer", {
        message: "Start date must be before expiry date",
      });
      return;
    }

    const offerExist = await offerDb.findOne({ name: name });
    if (offerExist) {
      res.render("new-offer", { message: "Offer already existing" });
    } else {
      const offer = new offerDb({
        name: name,
        startingDate: startingDate,
        expiryDate: expiryDate,
        percentage: percentage,
        search: search,
        page: page,
      });
      await offer.save();
      res.redirect("/admin/offerDashboard");
    }
  } catch (error) {
    console.log(error.message);
    throw new Error(error);
  }
};

// ==================================================================post edit offer page in admin side ============================================

const postEditOffer = async (req, res) => {
  try {
    const { id, name, startingDate, expiryDate, percentage } = req.body;

    await offerDb.updateOne(
      { _id: id },
      {
        $set: {
          name: name.toUpperCase(),
          startingDate: startingDate,
          expiryDate: expiryDate,
          percentage: percentage,
        },
      }
    );
    res.redirect("/admin/offerDashboard");
  } catch (error) {
    console.log(error.message);
    throw new Error(error);
  }
};

// ==================================================================cancel offer from admin side============================================

const cancelOffer = async (req, res) => {
  try {
    const { offerId } = req.body;

    // Update products
    await Product.updateMany(
      { offer: offerId },
      {
        $unset: {
          offer: 1,
          discountedPrice: 1,
        },
      }
    );

   


     const remove=await Product.updateMany(
      { categoryOffer: offerId },
      {
        $unset: {
          categoryOffer: 1,
          categoryDiscountedPrice: 1,
        },
      }
    );



    // Update categories
    await Category.updateMany(
      { offer: offerId },
      {
        $unset: {
          offer: 1,
        },
      }
    );

    // Update the offer status
    await offerDb.updateOne(
      { _id: offerId },
      {
        $set: {
          status: false,
        },
      }
    );

    res.json({ cancelled: true });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ cancelled: false, message: "Error cancelling offer" });
  }
};




module.exports = {
  loadOffer,
  loadaddOffer,
  loadEditOffer,
  AddOffer,
  postEditOffer,
  cancelOffer,
};
