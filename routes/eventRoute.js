const express = require("express");
const router = express.Router();
const isLoggedIn = require("../middleware/auth");
const eventController = require("../controllers/eventController");
const  isAdmin  = require("../middleware/adminAuth");
 
// console.log("isLoggedIn:", isLoggedIn);
// console.log("isAdmin:", isAdmin);
// console.log("eventController.createEvent:", eventController.createEvent);



// PUBLIC ROUTES
router.route("/events").get(eventController.getEvents);
router.route("/events/:id").get(eventController.getEventById)

// PROTECTED (Admin Only — Optional)
router.route("/events").post(isLoggedIn, isAdmin, eventController.createEvent);
router.route("/events/:id").put(isLoggedIn, isAdmin, eventController.updateEvent);
router.route("/events/:id").delete(isLoggedIn, isAdmin, eventController.deleteEvent);


module.exports = router;

