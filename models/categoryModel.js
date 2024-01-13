const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
  {
    categoryName: {
      type: String,
      required: true,
      unique: true,
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
    createdAt: {
      type: Date,
      default: Date.now,
    },
    offer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "offer",
    },
    
  },
  { timestamps: true }
);


module.exports = mongoose.model("Category", categorySchema);
