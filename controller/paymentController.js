const Payment = require("../models/Payment");
const Booking = require("../models/Booking");

// UPDATE PAYMENT STATUS
exports.updatePaymentStatus = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const { transactionId, status } = req.body;

    const payment = await Payment.findById(paymentId);
    if (!payment) return res.status(404).json({ message: "Payment not found" });

    payment.transactionId = transactionId;
    payment.status = status;
    await payment.save();

    // Auto-confirm booking if paid
    if (status === "Paid") {
      await Booking.findByIdAndUpdate(payment.booking, { status: "Confirmed" });
    }

    res.json({ message: "Payment updated successfully", payment });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
