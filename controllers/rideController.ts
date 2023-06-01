import { Request, Response } from "express";
import { body, validationResult, Result } from "express-validator";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User, { IUser } from "../models/User";
import dotenv from "dotenv";
import Ride from "../models/Ride";
import Vehicle from "../models/Vehicle";
import DriverRide from "../models/DriverRide";
import PassengerRide from "../models/PassengerRide";

dotenv.config({ path: "../config/config.env" });

interface AuthRequest extends Request {
  user?: IUser;
}

// @route    GET api/rides/available-drivers
// @desc     Get a list of available drivers in close proximity to the passenger
// @access   Public
// export const getAvailableDrivers = async (req: Request, res: Response) => {
//   const errors = validationResult(req);
//   if (!errors.isEmpty()) {
//     return res.status(400).json({ errors: errors.array() });
//   }
//   try {

//     // PASSENGER SHOULD CHOOSE A LOCATION WHERE THEY ARE USING GOOGLE MAP OR GEOLOCATION
//     const { passengerLatitude, passengerLongitude } = req.query;
//     const maxDistance = 10; // Maximum distance in kilometers

//     if (typeof passengerLatitude !== 'string' || typeof passengerLongitude !== 'string') {
//       return res.status(400).json({ msg: "Invalid latitude or longitude" });
//     }

//     // Find available drivers in close proximity to the passenger
//     const drivers = await Vehicle.find({
//       available: true,
//       location: {
//         $nearSphere: {
//           $geometry: {
//             type: "Point",
//             coordinates: [parseFloat(passengerLongitude), parseFloat(passengerLatitude)],
//           },
//           $maxDistance: maxDistance * 1000, // Convert max distance to meters
//         },
//       },
//     }).populate("driver");

//     res.json(drivers);
//   } catch (error) {
//     console.error(error);
//     res.status(500).send("Server Error");
//   }
// };

// @route    GET api/rides/available-drivers
// @desc     Get a list of available drivers in close proximity to the passenger
// @access   Public (Passenger)
export const getAvailableDrivers = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    // PASSENGER SHOULD CHOOSE A LOCATION WHERE THEY ARE USING GOOGLE MAP OR GEOLOCATION
    const { passengerLatitude, passengerLongitude } = req.query;

    if (
      typeof passengerLatitude !== "string" ||
      typeof passengerLongitude !== "string"
    ) {
      return res.status(400).json({ msg: "Invalid latitude or longitude" });
    }

    // NOTE: CHECK IF VEHICLE IS AVAILABLE, IF VEHICLE ISN'T, DON'T SHOW
    // SOMETIMES A PASSENGER CAN TELL THE TO LET THEM BE THE ONLY PASSENGER (EXTRA COST)

    // FIND AVAILABEL DRIVERS IN CLOSE PROXIMITY
    const drivers = await DriverRide.find({
      pickupLocation: {
        $nearSphere: {
          $geometry: {
            type: "Point",
            coordinates: [
              parseFloat(passengerLongitude),
              parseFloat(passengerLatitude),
            ],
          },
          $maxDistance: 5000, // Maximum distance in meters (adjust as needed)
        },
      },
    })
      .populate("driver", "firstname")
      .populate("passengers", "firstname");

    // Format the response data
    const availableDrivers = drivers.map((driver) => {
      const { driver: driverId, passengers, seatsAvailable, price } = driver;
      const passengerNames = passengers.map(
        (passenger: any) => passenger.firstname
      );

      return {
        driver: driverId,
        seatsAvailable,
        price,
        passengers: passengerNames,
      };
    });

    res.status(200).json(availableDrivers);
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve available drivers" });
  }
};

// @route    POST api/rides
// @desc     Create a new ride
// @access   Private (Driver)
export const createRide = async (req: AuthRequest, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const { driverId, vehicleId, pickupLocation, dropoffLocation, seatsAvailable, price } =
      req.body;

    // FIND THE DRIVER BY DRIVERID
    const driver = await User.findById(driverId);

    if (!driver || driver.role !== "driver") {
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

    res.status(201).json({ message: "Ride created successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
};

// @route    POST api/rides/:rideId/requests
// @desc     Create a new ride request
// @access   Private (Passenger)
export const createRideRequest = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const {
      passengerId,
      pickupLocation,
      dropoffLocation,
      numberOfPassengers,
      price,
    } = req.body;

    // GET THE ID OF THE RIDE YOU WANT TO BE ON
    const { rideId } = req.params;

    // FIND THE PASSENGER BY PASSENGERID
    const passenger = await User.findById(passengerId);
    if (!passenger || passenger.role !== "passenger") {
      return res.status(404).json({ error: "Passenger not found" });
    }


        // FIND THE RIDE BY RIDEID
        const ride = await DriverRide.findById(rideId).populate("driver");
        if (!ride) {
          return res.status(404).json({ error: "Ride not found" });
        }
    
    
    

    // CHECK IF THE RIDE HAS AVAILABLE SEATS
    if (ride.seatsAvailable <= 0) {
      return res.status(400).json({ error: "No available seats on this ride" });
    }

    // Create a new passenger ride request
    const newPassengerRide = new PassengerRide({
      passenger: passengerId,
      driver: ride.driver?._id,
      pickupLocation,
      dropoffLocation,
      numberOfPassengers,
      price,
      // status: "requested",
    });

    await newPassengerRide.save();

    res.status(200).json({
      message: "Ride request created",
      requestId: newPassengerRide._id,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to create ride request" });
  }
};

// export const acceptRideRequest = async (req: Request, res: Response) => {
//   const { rideId, passengerId, numberOfPassengers } = req.body;

//   try {
//     // Find the ride document by rideId
//     const ride = await Ride.findById(rideId);

//     if (!ride) {
//       return res.status(404).json({ error: "Ride not found" });
//     }

//     // Find the passenger by passengerId
//     const passenger = await User.findById(passengerId);

//     if (!passenger || passenger.role !== "passenger") {
//       return res.status(404).json({ error: "Passenger not found" });
//     }

//     // Check if the requested number of passengers exceeds the available seats
//     if (numberOfPassengers > ride.seatsAvailable) {
//       return res.status(400).json({ error: "Insufficient available seats" });
//     }

//     // Add the passenger to the ride's passengers array
//     ride.passengers.push(passengerId);

//     // Update the available seat count
//     ride.seatsAvailable -= numberOfPassengers;

//     // Save the updated ride document
//     await ride.save();

//     res.status(200).json({ message: "Ride request accepted" });
//   } catch (error) {
//     res.status(500).json({ error: "Failed to accept ride request" });
//   }
// };

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
    if (passengerRide.status === "accepted") {
      return res
        .status(400)
        .json({ error: "Ride request is already accepted" });
    } else if (passengerRide.status === "cancelled") {
      return res
        .status(400)
        .json({ error: "Ride request is already cancelled" });
    }

    // HANDLE THE DRIVER'S ACTION
    if (action === "accept") {
      // UPDATE THE STATUS OF THE PASSENGER RIDE REQUEST TO "ACCEPTED"
      passengerRide.status = "accepted";
      await passengerRide.save();

      // ADD THE PASSENGER TO THE RIDE'S PASSENGERS ARRAY
      ride.passengers.push(passengerRide.passenger);
      await ride.save();

      return res.status(200).json({ message: "Ride request accepted by driver" });
    } else if (action === "cancel") {
      // UPDATE THE STATUS OF THE PASSENGER RIDE REQUEST TO "CANCELLED"
      passengerRide.status = "cancelled";
      await passengerRide.save();

      return res.status(200).json({ message: "Ride request cancelled" });
    } else {
      // IF ACTION GIVEN IS NOT ACCEPTED OR CANCELLED (WILL UPDATE LATER)
      return res.status(400).json({ error: "Invalid action" });
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to accept/cancel ride request" });
  }
};
