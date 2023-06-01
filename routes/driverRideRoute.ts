import express from "express";
import {
  acceptRideRequest,
  createRide,
  deleteRide,
  getAllRides,
  getRideById,
  updateRide,
} from "../controllers/driverRideController";
import { verifyTokenAndUser } from "../middlewares/authMiddleware";
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
  verifyTokenAndUser,
  createRide
);

// Get list of rides created by driver
router.get("/", verifyTokenAndUser, getAllRides);

// Get a ride by the ride's id
router.get("/:rideId", verifyTokenAndUser, getRideById);

// Update a ride created by the driver
router.put("/:rideId", verifyTokenAndUser, updateRide);

// Accept or cancel a ride request (Driver)
router.put(
  "/:rideId/requests/:requestId",
  verifyTokenAndUser,
  acceptRideRequest
);

// @route   DELETE api/rides/:id
// @desc    Delete a ride
// @access  Private (Driver)
router.delete("/:rideId", verifyTokenAndUser, deleteRide);

export default router;
