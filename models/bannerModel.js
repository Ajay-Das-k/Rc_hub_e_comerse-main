const mongoose = require("mongoose");

const bannerSchema = new mongoose.Schema(
  {
    bannerName: {
      type: String,
      required: true,
    },
    bannerName2: {
      type: String,
      required: true,
    },
    specification: {
      type: String,
      required: true,
    },
    coverPic: {
      type: String,
      required: true,
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    is_block: {
      type: Boolean,
      default: 1,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Banner', bannerSchema);

