import express from "express";
import {
  acceptRideRequest,
  createRide,
  deleteRide,
  getAllRides,
  getRideById,
  getRideRequestById,
  getRideRequests,
  updateRide,
} from "../controllers/driverRideController";
import { verifyToken } from "../middlewares/authMiddleware";
import { body } from "express-validator";

const router = express.Router();

//  Create a new ride (driver)
router.post(
  "/",
  body("pickupLocation", "Please enter your pick up location").not().isEmpty(),
  body("dropoffLocation", "Please enter your drop off location")
    .not()
    .isEmpty(),
  body(
    "seatsAvailable",
    "Please seats available shouldnt be less than 1"
  ).isLength({ min: 1 }),
  body("price", "Please enter the price of your ride").isLength({ min: 1 }),
  verifyToken,
  createRide
);

// Get list of rides created by driver
router.get("/", verifyToken, getAllRides);

// Get a ride by the ride's id
router.get("/:rideId", verifyToken, getRideById);

// Get ride requests for a specific ride
router.get("/:rideId/requests", verifyToken, getRideRequests);

// Get request by id for a specific ride
router.get("/:rideId/requests/:requestId", verifyToken, getRideRequestById);

// Update a ride created by the driver
router.put("/:rideId", verifyToken, updateRide);

// Accept or cancel a ride request (Driver)
router.put("/:rideId/requests/:requestId", verifyToken, acceptRideRequest);

// @route   DELETE api/rides/:id
// @desc    Delete a ride
// @access  Private (Driver)
router.delete("/:rideId", verifyToken, deleteRide);

module.exports = router;
