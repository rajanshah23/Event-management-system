const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/paymentController");
const isLoggedIn = require("../middleware/auth");

// console.log("isLoggedIn:", isLoggedIn);
// console.log("paymentController:", paymentController);


// Initiate payment
router.route("/payments").post(isLoggedIn, paymentController.createPayment);

// Get user's payments
router.route("/payments/me").get(isLoggedIn, paymentController.getMyPayments);

// Get single payment
router.route("/payments/:paymentId").get(isLoggedIn, paymentController.getPayment);

//  callback to update status  
router.route("/payments/:paymentId/status").patch(
  paymentController.updatePaymentStatus
);  

module.exports = router;