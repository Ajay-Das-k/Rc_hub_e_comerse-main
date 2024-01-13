const mongoose = require("mongoose");

const brandSchema = new mongoose.Schema(
  {
    brandName: {
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
    is_block: {
      type: Boolean,
      default: 1,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Brand', brandSchema);


