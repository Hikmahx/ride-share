import express from "express";

import { verifyTokenAndUser } from "../middlewares/authMiddleware";
import { body } from "express-validator";
import { completeRideRequest, createRideRequest, deleteRequest, getAllRequests, getAvailableDrivers, getRequestById, updateRequest } from "../controllers/passengerRideController";

const router = express.Router();

//  Create a new ride
router.post(
  "/:rideId/requests",
  body("pickupLocation", "Please enter your pick up location").not().isEmpty(),
  body("dropoffLocation", "Please enter your drop off location")
    .not()
    .isEmpty(),
  body(
    "numberOfPassengers",
    "Please passenger number shouldnt be less than 1"
  ).isLength({ min: 1 }),
  body("price", "Please enter the price of your ride").isLength({ min: 1 }),
  verifyTokenAndUser,
  createRideRequest
);

// Get a list of available drivers in close proximity to the passenger's location
router.get("/available-drivers", verifyTokenAndUser, getAvailableDrivers);

// Get list of ride requests made by the passenger
router.get("/requests", verifyTokenAndUser, getAllRequests);

// Get a specific ride request made by the passenger
router.get("requests/:requestId", verifyTokenAndUser, getRequestById);

// Update a ride request details
router.put("/:rideId/requests/:requestId", verifyTokenAndUser, updateRequest);

// Accept or cancel a ride request (Driver)
router.put(
  "/:rideId/requests/:requestId",
  verifyTokenAndUser,
  completeRideRequest
);

// @route   DELETE api/rides/:id
// @desc    Delete a ride
// @access  Private (Driver)
router.delete("/:rideId/requests/:requestId", verifyTokenAndUser, deleteRequest);

export default router;
