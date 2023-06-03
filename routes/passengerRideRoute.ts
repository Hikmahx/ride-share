import express from "express";

import { verifyToken, verifyTokenAndUser } from "../middlewares/authMiddleware";
import { body } from "express-validator";
import {
  completeRideRequest,
  createRideRequest,
  deleteRequest,
  getAllRequests,
  getAvailableDriverRideById,
  getAvailableDrivers,
  getRequestById,
  updateRequest,
} from "../controllers/passengerRideController";

const router = express.Router();

//  Create a new ride request
router.post(
  "/available-drivers/:rideId/requests",
  body("pickupLocation", "Please enter your pick up location").not().isEmpty(),
  body("dropoffLocation", "Please enter your drop off location")
    .not()
    .isEmpty(),
  body(
    "numberOfPassengers",
    "Please passenger number shouldnt be less than 1"
  ).isLength({ min: 1 }),
  body("price", "Please enter the price of your ride").isLength({ min: 1 }),
  verifyToken,
  createRideRequest
);

// Get a list of available drivers in close proximity to the passenger's location
router.get("/available-drivers", verifyToken, getAvailableDrivers);

// Get an available driver's ride by rideId
router.get("/available-drivers/:rideId", verifyToken, getAvailableDriverRideById);

// Get list of ride requests made by the passenger
router.get("/requests", verifyToken, getAllRequests);

// Get a specific ride request made by the passenger
router.get("/requests/:requestId", verifyToken, getRequestById);

// Update a ride request details
router.put("/available-drivers/:rideId/requests/:requestId", verifyToken, updateRequest);

// Ride completed (Passenger)
router.put(
  "/available-drivers/:rideId/requests/:requestId",
  verifyToken,
  completeRideRequest
);

//  Delete a request
router.delete(
  "/available-drivers/:rideId/requests/:requestId",
  verifyToken,
  deleteRequest
);

module.exports = router;
