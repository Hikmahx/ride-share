import { Request, Response } from "express";
import { validationResult, Result } from "express-validator";
import User, { IUser } from "../models/User";
import dotenv from "dotenv";
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
      pickupLocation,
      dropoffLocation,
      seatsAvailable,
      price,
    } = req.body;

    // FIND THE DRIVER BY DRIVERID
    const driver = await User.findById(req.user?.id);

    if (!driver || driver.role != "driver") {
      return res.status(404).json({ error: "Driver not found" });
    }

    if (!driver?.verified) {
      res.status(403).json({ message: "You need to be verified to do this" });
    }

    // // FIND THE VEHICLE OF THE DRIVER
    const driverVehicle = await Vehicle.findOne({ driver: req.user?.id });
    if (!driverVehicle) {
      return res
        .status(404)
        .json({ error: "Driver need a vehicle before creating a ride" });
    }

    // Create a new driver ride
    const driverRide = new DriverRide({
      driver: req.user?.id,
      vehicle: driverVehicle,
      pickupLocation,
      dropoffLocation,
      seatsAvailable,
      price,
    });

    await driverRide.save();

    res.status(200).json({ message: "Ride created successfully", driverRide });
  } catch (err) {
    console.error(err);
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
  } catch (err: any) {
    console.error(err.message);
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
  } catch (err: any) {
    if (err.name === "CastError") {
      return res.status(400).json({ msg: "Ride doesn't exist" });
    }
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

// @route    GET api/rides/:rideId/requests
// @desc     Get ride requests for a specific ride
// @access   Private (Driver)
export const getRideRequests = async (req: AuthRequest, res: Response) => {
  try {
    const { rideId } = req.params;

    // Find the ride by rideId
    const ride = await DriverRide.findById(rideId)
      // .populate("vehicle");

    if (!ride) {
      return res.status(404).json({ error: "Ride not found" });
    }

    // Check if the authenticated user is the driver of the ride
    if (ride.driver?.toString() != req.user?.id) {
      return res
        .status(401)
        .json({ error: "Not authorized to view ride requests" });
    }

    // Find the ride requests for the specified ride created by driver
    const rideRequests = await PassengerRide.find({ driver: req.user?.id, ride: rideId});

    res.status(200).json({
      requests: rideRequests,
    });
  } catch (err: any) {
    if (err.name === "CastError") {
      return res.status(400).json({ msg: "Ride doesn't exist" });
    }
    console.error(err);
    res.status(500).json({ error: "Failed to retrieve ride requests" });
  }
};

// @route    GET api/rides/:rideId/requests/:requestId
// @desc     Get specific request for a ride
// @access   Private (Driver)
export const getRideRequestById = async (req: AuthRequest, res: Response) => {
  try {
    const { rideId, requestId } = req.params;

    // Find the ride by rideId
    const ride = await DriverRide.findById(rideId)

    if (!ride) {
      return res.status(404).json({ error: "Ride not found" });
    }

    // Check if the authenticated user is the driver of the ride
    if (ride.driver?.toString() != req.user?.id) {
      return res
        .status(401)
        .json({ error: "Not authorized to view ride requests" });
    }

    // Find request by id for the specified ride created by driver
    const rideRequest = await PassengerRide.findOne({ driver: req.user?.id, ride: rideId, _id:requestId});


    if (!rideRequest) {
      return res.status(404).json({ error: "Ride request not found" });
    }

    res.status(200).json({
     
      rideRequest,
    });
  } catch (err: any) {
    if (err.name === "CastError") {
      return res.status(400).json({ msg: "Request doesn't exist" });
    }
    console.error(err);
    res.status(500).json({ error: "Failed to retrieve ride request" });
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

    // FIND THE DRIVER BY DRIVERID
    const driver = await User.findById(req.user?.id);

    if (!driver?.verified) {
      res.status(403).json({ message: "You need to be verified to do this" });
    }

    const ride = await DriverRide.findById(req.params.rideId);

    if (!ride) {
      return res.status(404).json({ msg: "Ride not found" });
    }

    // Check if the user is the creator of the ride
    if (ride.driver?.toString() != req.user?.id) {
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
          // ...updatedFields, // I commented this bcos it is best for only the four fields to be allowed update here
        },
      },
      { new: true }
    );

    res.status(200).json({ msg: "Ride is successfully updated", updatedRide });
  } catch (err: any) {
    if (err.name === "CastError") {
      return res.status(400).json({ msg: "Ride doesn't exist" });
    }

    console.error(err.message);
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
    const { status } = req.body;

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

    // HANDLE THE DRIVER'S status
    if (status == "accepted") {
      // UPDATE THE STATUS OF THE PASSENGER RIDE REQUEST TO "ACCEPTED"
      passengerRide.status = "accepted";
      await passengerRide.save();

      // ADD THE PASSENGER TO THE RIDE'S PASSENGERS ARRAY
      ride.passengers.push(passengerRide.passenger);
      await ride.save();

      return res
        .status(200)
        .json({ message: "Ride request accepted by driver" });
    } else if (status == "cancelled") {
      // UPDATE THE STATUS OF THE PASSENGER RIDE REQUEST TO "CANCELLED"
      passengerRide.status = "cancelled";
      await passengerRide.save();

      return res.status(200).json({ message: "Ride request cancelled" });
    } else {
      // IF status GIVEN IS NOT ACCEPTED OR CANCELLED (WILL UPDATE LATER, IE IF ITS COMPLETED IT IS THE PASSENGER WHO WILL PERFORM THIS STATUS)
      return res.status(400).json({ error: "Invalid status" });
    }
  } catch (err: any) {
    if (err.name === "CastError") {
      return res.status(400).json({ msg: "Ride or Request doesn't exist" });
    }
    res.status(500).json({ error: "Failed to accept/cancel ride request" });
  }
};


// @route    PUT api/rides/:rideId/passengers/:requestId
// @desc     Remove a passenger from a ride
// @access   Private (Driver)
export const removePassenger = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { rideId, requestId } = req.params;

    // FIND THE RIDE BY RIDEID
    const ride = await DriverRide.findById(rideId);
    if (!ride) {
      return res.status(404).json({ error: "Ride not found" });
    }

        // SET/ UPDATE PASSENGER'S REQUEST TO CANCELLED
        const passengerRide = await PassengerRide.findById(requestId);

        if (!passengerRide) {
          return res.status(404).json({ error: 'Passenger ride not found' });
        }

    // CHECK IF THE PASSENGER EXISTS IN THE RIDE'S PASSENGERS ARRAY
    if (!ride.passengers.some((passenger) => passenger.equals(passengerRide.passenger))) {
      return res.status(400).json({ error: "Passenger not found in ride" });
    }


 
     passengerRide.status = 'cancelled';
     await passengerRide.save();

    // REMOVE THE PASSENGER FROM THE RIDE'S PASSENGERS ARRAY
    ride.passengers = ride.passengers.filter((passenger) => !passenger.equals(passengerRide.passenger));
    await ride.save();

    res.status(200).json({ message: "Passenger removed from ride" });
  } catch (err: any) {
    if (err.name === "CastError") {
      return res.status(400).json({ msg: "Ride or Passenger doesn't exist" });
    }
    res.status(500).json({ error: "Failed to remove passenger from ride" });
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

    // Check if the user is the creator of the ride
    if (ride.driver?.toString() != req.user?.id) {
      return res
        .status(401)
        .json({ msg: "Not authorized to delete this ride" });
    }

    res.status(200).json({ msg: "Ride is successfully deleted" });
  } catch (err: any) {
    if (err.name === "CastError") {
      return res.status(400).json({ msg: "Ride doesn't exist" });
    }
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};
