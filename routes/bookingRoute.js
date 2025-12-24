const express = require("express");
const router = express.Router();

const isLoggedIn=require("../middleware/auth")
const bookingController=require("../controllers/bookingController")

// Create new booking
router.route("/bookings").post(isLoggedIn,bookingController.createBooking);

// Get logged-in user's bookings
router.route("/bookings/me").get(isLoggedIn,bookingController.getMyBookings);

// Get single booking by ID
router.route("/bookings/:id").get(isLoggedIn,bookingController.getBookingById);

// Cancel booking
router.route("/bookings/:id").delete(isLoggedIn,bookingController.cancelBooking);

module.exports = router;
