const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    mobile: {
      type: String,
      required: true,
      unique: true,
    },
    image: {
      type: String,
      required: true,
    },

    password: {
      type: String,
      required: true,
    },

    referralCode: {
      type: String,
      default: "",
    },
    isReferralUsed: {
      type: Number,
      default: 0,
    },
    userReferralUsed: {
      type: Number,
      default: 0,
    },
    referralAmountCredited: {
      type: Number,
      default: 0,
    },

    is_admin: {
      type: Number,
      required: true,
    },
    is_varified: {
      type: Number,
      default: 0,
    },
    is_block: {
      type: Number,
      default: 1,
    },
    token: {
      type: String,
      default: "",
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    wallet: {
      type: Number,
      default: 0,
    },
    walletHistory: [
      {
        transactionDate: {
          type: Date,
        },
        transactionDetails: {
          type: String,
        },
        transactionType: {
          type: String,
        },
        transactionAmount: {
          type: Number,
        },
        currentBalance: {
          type: Number,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);


module.exports = mongoose.model('User',userSchema);