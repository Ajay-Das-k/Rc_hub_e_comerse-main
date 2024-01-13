const mongoose = require("mongoose");

const dealSchema = new mongoose.Schema(
  {
    dealName: {
      type: String,
      required: true,
    },
    title: {
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

module.exports = mongoose.model("Deal", dealSchema);
