import express from "express";
import { verifyToken, verifyTokenAndUser } from "../middlewares/authMiddleware";
import { body } from "express-validator";
import {
  createVehicle,
  getDriverVehicle,
  updateVehicle,
} from "../controllers/vehicleController";

const router = express.Router();

//  Create a new Vehicle (driver)
router.post(
  "/",
  body("make", "Please enter your vehicle's make").not().isEmpty(),
  body("model", "Please enter your vehicle's model").not().isEmpty(),
  body("color", "Please enter your vehicle's color").not().isEmpty(),
  body("plateNumber", "Please enter your vehicle's plate number")
    .not()
    .isEmpty(),
  body("location", "Please enter your vehicle's location").not().isEmpty(),
  body("available", "Please enter if your vehicle is available for rides")
    .not()
    .isEmpty(),
  body("seats", "Please seats shouldnt be less than 1").isLength({ min: 1 }),
  verifyToken,
  createVehicle
);

//  Get vehicle of a driver
router.get("/", verifyToken, getDriverVehicle);

// Update the vehicle of a driver
router.put("/:id", verifyToken, updateVehicle);

module.exports = router;
