const Booking = require("../models/bookingModel");
const Event = require("../models/eventModel");
const Payment = require("../models/paymentModel");
const mongoose = require("mongoose");

// CREATE BOOKING
exports.createBooking = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { eventId, tickets, theme, paymentMethod } = req.body;
    const userId = req.user._id; // from auth middleware

    if (!eventId || !tickets || tickets.length === 0) {
      return res.status(400).json({ message: "Event and tickets are required." });
    }

    const event = await Event.findById(eventId).session(session);
    if (!event) return res.status(404).json({ message: "Event not found" });

    // Validate ticket types & availability
    let totalAmount = 0;
    const updatedTickets = [...event.tickets];

    for (let t of tickets) {
      const foundTicketIndex = updatedTickets.findIndex((et) => et.type === t.ticketType);
      if (foundTicketIndex === -1) {
        throw new Error(`Invalid ticket type: ${t.ticketType}`);
      }

      // Check availability
      if (updatedTickets[foundTicketIndex].sold + t.quantity > updatedTickets[foundTicketIndex].quantity) {
        throw new Error(`Not enough ${t.ticketType} tickets available.`);
      }

      // Calculate cost
      totalAmount += t.quantity * updatedTickets[foundTicketIndex].price;

      // Update sold count
      updatedTickets[foundTicketIndex].sold += t.quantity;
    }

    // Create booking
    const booking = await Booking.create(
      [
        {
          event: eventId,
          user: userId,
          tickets,
          theme,
          totalAmount,
          status: "Pending",
        },
      ],
      { session }
    );

    // Create payment placeholder
    const payment = await Payment.create(
      [
        {
          booking: booking[0]._id,
          amount: totalAmount,
          method: paymentMethod || "Card",
          status: "Pending",
        },
      ],
      { session }
    );

    booking[0].payment = payment[0]._id;
    await booking[0].save({ session });

    // Update event sold values
    event.tickets = updatedTickets;
    await event.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({
      message: "Booking created successfully",
      booking: booking[0],
      payment: payment[0],
    });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({ message: err.message });
  }
};

// GET ALL BOOKINGS FOR USER
exports.getMyBookings = async (req, res) => {
  try {
    const userId = req.user._id;
    const bookings = await Booking.find({ user: userId })
      .populate("event payment user", "title startDate method amount status")
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET BOOKING BY ID
exports.getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate("event")
      .populate("payment")
      .populate("user", "name email");

    if (!booking) return res.status(404).json({ message: "Booking not found" });

    res.json(booking);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// CANCEL BOOKING
exports.cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) return res.status(404).json({ message: "Booking not found" });
    if (booking.status === "Cancelled") {
      return res.status(400).json({ message: "Booking already cancelled" });
    }

    booking.status = "Cancelled";
    await booking.save();

    res.json({ message: "Booking cancelled successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
