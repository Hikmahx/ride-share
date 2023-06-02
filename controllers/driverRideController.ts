import { Request, Response } from "express";
import { body, validationResult, Result } from "express-validator";
// import bcrypt from "bcryptjs";
// import jwt from "jsonwebtoken";
import User, { IUser } from "../models/User";
import dotenv from "dotenv";
// import Ride from "../models/Ride";
import Vehicle from "../models/Vehicle";
import DriverRide from "../models/DriverRide";
import PassengerRide from "../models/PassengerRide";

dotenv.config({ path: "../config/config.env" });

interface AuthRequest extends Request {
  user?: IUser;
}

// POST REQUESTS
// ---

// @route    POST api/rides
// @desc     Create a new ride
// @access   Private (Driver)
export const createRide = async (req: AuthRequest, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const {
      driverId,
      vehicleId,
      pickupLocation,
      dropoffLocation,
      seatsAvailable,
      price,
    } = req.body;

    // FIND THE DRIVER BY DRIVERID
    const driver = await User.findById(driverId);

    if (!driver || driver.role != "driver") {
      return res.status(404).json({ error: "Driver not found" });
    }

    // FIND THE VEHICLE BY VEHICLEID
    const vehicle = await Vehicle.findById(vehicleId);

    if (!vehicle) {
      return res.status(404).json({ error: "Vehicle not found" });
    }

    // Create a new driver ride
    const driverRide = new DriverRide({
      driver: driverId,
      vehicle: vehicleId,
      pickupLocation,
      dropoffLocation,
      seatsAvailable,
      price,
    });

    await driverRide.save();

    // res.status(201).json({ message: "Ride created successfully" });
    res.status(200).json({ message: "Ride created successfully", driverRide });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
};

// GET REQUESTS
// ---

// @route    GET api/rides
// @desc     Get all rides created by the driver
// @access   Private (Driver)
export const getAllRides = async (req: AuthRequest, res: Response) => {
  try {
    // RETRIEVE THE DRIVER'S ID FROM THE AUTHENTICATED USER
    const driverId = req.user?.id;

    // FIND ALL RIDES WHERE THE DRIVER'S ID MATCHES the 'DRIVER' FIELD
    const rides = await DriverRide.find({ driver: driverId });

    res.status(200).json(rides);
  } catch (error: any) {
    console.error(error.message);
    res.status(500).send("Server Error");
  }
};

// @route    GET api/rides/:rideId
// @desc     Get a single ride by ID
// @access   Private (Driver)
export const getRideById = async (req: AuthRequest, res: Response) => {
  try {
    // Retrieve the driver's ID from the authenticated user
    const driverId = req.user?.id;

    // Find the ride by its ID and check if the driver's ID matches the 'driver' field
    const ride = await DriverRide.findOne({
      _id: req.params.rideId,
      driver: driverId,
    });

    if (!ride) {
      return res.status(404).json({ error: "Ride not found" });
    }

    res.status(200).json(ride);
  } catch (error: any) {
    console.error(error.message);
    res.status(500).send("Server Error");
  }
};

// PUT REQUESTS
// ---

// @route    PUT api/rides/:rideId
// @desc     update a ride
// @access   Private (Driver)
export const updateRide = async (req: AuthRequest, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const {
      pickupLocation,
      dropoffLocation,
      seatsAvailable,
      price,
      ...updatedFields
    } = req.body;

    const ride = await DriverRide.findById(req.params.rideId);

    if (!ride) {
      return res.status(404).json({ msg: "Ride not found" });
    }

    // Check if the user is the creator of the ride or an admin
    if (ride.driver?.toString() != req.user?.id || req.user?.role != "admin") {
      return res
        .status(401)
        .json({ msg: "Not authorized to update this ride" });
    }

    // UPDATE THE RIDE
    const updatedRide = await DriverRide.findByIdAndUpdate(
      req.params.rideId,
      {
        $set: {
          pickupLocation,
          dropoffLocation,
          seatsAvailable,
          price,
          ...updatedFields,
        },
      },
      { new: true }
    );

    res.status(200).json({ msg: "Ride is successfully updated", updateRide });
  } catch (error: any) {
    console.error(error.message);
    res.status(500).send("Server Error");
  }
};

// @route    PUT api/rides/:rideId/requests/:requestId
// @desc     Accept or cancel a ride request
// @access   Private (Driver)
export const acceptRideRequest = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { rideId, requestId } = req.params;
    const { action } = req.body;

    // FIND THE RIDE BY RIDEID
    const ride = await DriverRide.findById(rideId);
    if (!ride) {
      return res.status(404).json({ error: "Ride not found" });
    }

    // FIND THE PASSENGER RIDE REQUEST BY REQUESTID
    const passengerRide = await PassengerRide.findById(requestId);
    if (!passengerRide) {
      return res.status(404).json({ error: "Ride request not found" });
    }

    // CHECK IF THE PASSENGER RIDE REQUEST IS ALREADY ACCEPTED OR CANCELLED
    if (passengerRide.status == "accepted") {
      return res
        .status(400)
        .json({ error: "Ride request is already accepted" });
    } else if (passengerRide.status == "cancelled") {
      return res
        .status(400)
        .json({ error: "Ride request is already cancelled" });
    }

    // HANDLE THE DRIVER'S ACTION
    if (action == "accept") {
      // UPDATE THE STATUS OF THE PASSENGER RIDE REQUEST TO "ACCEPTED"
      passengerRide.status = "accepted";
      await passengerRide.save();

      // ADD THE PASSENGER TO THE RIDE'S PASSENGERS ARRAY
      ride.passengers.push(passengerRide.passenger);
      await ride.save();

      return res
        .status(200)
        .json({ message: "Ride request accepted by driver" });
    } else if (action == "cancel") {
      // UPDATE THE STATUS OF THE PASSENGER RIDE REQUEST TO "CANCELLED"
      passengerRide.status = "cancelled";
      await passengerRide.save();

      return res.status(200).json({ message: "Ride request cancelled" });
    } else {
      // IF ACTION GIVEN IS NOT ACCEPTED OR CANCELLED (WILL UPDATE LATER, IE IF ITS COMPLETED IT IS THE PASSENGER WHO WILL PERFORM THIS ACTION)
      return res.status(400).json({ error: "Invalid action" });
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to accept/cancel ride request" });
  }
};

// DELETE REQUESTS

// @route    DELETE api/rides/:rideId
// @desc     Delete a ride
// @access   Private (Driver)
export const deleteRide = async (req: AuthRequest, res: Response) => {
  try {
    const ride = await DriverRide.findByIdAndDelete(req.params.rideId);

    if (!ride) {
      return res.status(404).json({ msg: "Ride not found" });
    }

    // Check if the user is the creator of the ride or an admin
    if (ride.driver?.toString() != req.user?.id || req.user?.role != "admin") {
      return res
        .status(401)
        .json({ msg: "Not authorized to delete this ride" });
    }

    res.status(200).json({ msg: "Ride is successfully deleted" });
  } catch (error: any) {
    console.error(error.message);
    res.status(500).send("Server Error");
  }
};
