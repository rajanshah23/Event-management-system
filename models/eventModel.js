const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    venue: {
      type: String,
      required: true,
    },
    organizer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    tickets: [
      {
        type: {
          type: String,
          required: true, // Regular, VIP, EarlyBird
        },
        price: {
          type: Number,
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
        },
        sold: {
          type: Number,
          default: 0,
        },
      },
    ],
    themes: {
      type: [String],
      default: ["Theme1", "Theme2"],
    },

    themes: {
      type: [String],
      default: ["Theme1", "Theme2"],
    },
    sponsors: {
      type: [
        {
          name: String,
          logo: String,
          package: String,
        },
      ],
      default: [],
    },
    capacity: Number,
    status: {
      type: String,
      enum: ["Upcoming", "Ongoing", "Completed", "Cancelled"],
      default: "Upcoming",
    },
    registrations: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Booking",
      },
    ],
  },

  { timestamps: true }
);

module.exports = mongoose.model("Event", eventSchema);
