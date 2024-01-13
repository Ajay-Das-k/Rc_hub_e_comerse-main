const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    productName: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    color: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    brand: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Brand",
      required: true,
    },
    coverPic: {
      type: Array,
      required: true,
    },
    images: {
      type: Array,
    },
    quantity: {
      type: Number,
      required: true,
    },
    
    is_block: {
      type: Boolean,
      default: 1,
    },
    offer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "offer",
    },
    categoryOffer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "offer",
    },
    discountedPrice: {
      type: Number,
    },
    categoryDiscountedPrice: {
      type: Number,
    },
  },
  { timestamps: true }
);


productSchema.pre("save", async function (next) {
  try {
    // Check if the price has changed
    if (this.isModified("price")) {
      // Check if there's an associated offer
      if (this.offer) {
        // Populate the offer field and use await without execPopulate
        await this.populate("offer");
        // Calculate the discounted price based on the offer percentage
        this.discountedPrice =
          this.price - (this.price * this.offer.percentage) / 100;
      }

      // Check if there's an associated category offer
      if (this.categoryOffer) {
        // Populate the category.offer field and use await without execPopulate
        await this.populate("categoryOffer");

        // Calculate the discounted price based on the category offer percentage
        this.categoryDiscountedPrice = parseInt(
          this.price - (this.price * this.categoryOffer.percentage) / 100
        );
      }
    }

    next();
  } catch (error) {
    console.error(error);
    next(error);
  }
});




module.exports = mongoose.model('Product', productSchema);
