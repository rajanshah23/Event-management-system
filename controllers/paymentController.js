const Payment = require("../models/paymentModel");
const Booking = require("../models/bookingModel");

// CREATE PAYMENT (Initiate payment for a booking)
const createPayment = async (req, res) => {
  try {
    const { bookingId } = req.body; // or req.params if passed in URL
    const userId = req.user._id; // assuming isLoggedIn middleware attaches req.user

    // Find the booking and verify it belongs to the user and is pending
    const booking = await Booking.findOne({
      _id: bookingId,
      user: userId,
      status: "Pending", // only allow payment for pending bookings
    }).populate("event");

    if (!booking) {
      return res.status(404).json({
        message: "Booking not found or not eligible for payment",
      });
    }

    // Prevent creating multiple payments for the same booking
    const existingPayment = await Payment.findOne({ booking: bookingId });
    if (existingPayment) {
      return res.status(400).json({
        message: "Payment already initiated for this booking",
        payment: existingPayment,
      });
    }

    // Calculate total amount (you can adjust based on your Booking model)
    // Assuming booking has a field like totalAmount or tickets with price
    const amount = booking.totalAmount || 0; // adjust according to your Booking schema

    const payment = await Payment.create({
      booking: bookingId,
      amount,
      method: req.body.method || "Card", // Card, Esewa, Khalti
      status: "Pending",
    });

    res.status(201).json({
      message: "Payment initiated successfully",
      payment,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET PAYMENT BY ID
const getPayment = async (req, res) => {
  try {
    const { paymentId } = req.params;

    const payment = await Payment.findById(paymentId)
      .populate("booking")
      .populate({
        path: "booking",
        populate: { path: "event" },
      });

    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    // Optional: restrict access to only the booking owner or admin
    // if (payment.booking.user.toString() !== req.user._id.toString()) { ... }

    res.json(payment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET ALL PAYMENTS FOR LOGGED-IN USER (via their bookings)
const getMyPayments = async (req, res) => {
  try {
    const userId = req.user._id;

    const bookings = await Booking.find({ user: userId }).select("_id");
    const bookingIds = bookings.map((b) => b._id);

    const payments = await Payment.find({ booking: { $in: bookingIds } })
      .populate({
        path: "booking",
        populate: { path: "event", select: "title startDate venue" },
      })
      .sort({ createdAt: -1 });

    res.json(payments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// UPDATE PAYMENT STATUS (Webhook or manual callback from payment gateway)
const updatePaymentStatus = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const { transactionId, status } = req.body; // status: "Paid" or "Failed"

    if (!["Paid", "Failed"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const payment = await Payment.findById(paymentId).populate("booking");
    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    // Prevent updating already Paid/Failed payments
    if (payment.status !== "Pending") {
      return res.status(400).json({
        message: `Payment is already ${payment.status}`,
      });
    }

    payment.transactionId = transactionId || payment.transactionId;
    payment.status = status;
    await payment.save();

    // If payment successful → confirm the booking
    if (status === "Paid") {
      await Booking.findByIdAndUpdate(
        payment.booking._id,
        { status: "Confirmed" },
        { new: true }
      );
    }

    // If failed → optionally change booking back to Pending or cancel
    if (status === "Failed") {
      await Booking.findByIdAndUpdate(payment.booking._id, {
        status: "Pending",
      });
    }

    res.json({
      message: "Payment status updated successfully",
      payment,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  createPayment,
  getPayment,
  getMyPayments,
  updatePaymentStatus,
};