import { Request, Response } from "express";
import { body, validationResult, Result } from "express-validator";
import User, { IUser } from "../models/User";
import dotenv from "dotenv";
import DriverRide from "../models/DriverRide";
import PassengerRide from "../models/PassengerRide";

dotenv.config({ path: "../config/config.env" });

interface AuthRequest extends Request {
  user?: IUser;
}

// POST REQUESTS
// ---

// @route    POST api/passengers/:rideId/requests
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
    if (!passenger || passenger.role != "passenger") {
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
  } catch (err: any) {
    console.error(err.message);
    res.status(500).json({ error: "Failed to create ride request" });
  }
};

// GET REQUESTS
// ---

// @route    GET api/passengers/available-drivers?search={pickupLocation}
// @desc     Get a list of available drivers in close proximity to the passenger
// @access   Public (Passenger)
export const getAvailableDrivers = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    // PASSENGER SHOULD CHOOSE A LOCATION WHERE THEY ARE USING GOOGLE MAP OR GEOLOCATION
    // const { passengerLatitude, passengerLongitude } = req.query;

    // if (
    //   typeof passengerLatitude != "string" ||
    //   typeof passengerLongitude != "string"
    // ) {
    //   return res.status(400).json({ msg: "Invalid latitude or longitude" });
    // }

    // NOTE: CHECK IF VEHICLE IS AVAILABLE, IF VEHICLE ISN'T, DON'T SHOW
    // SOMETIMES A PASSENGER CAN TELL THE TO LET THEM BE THE ONLY PASSENGER (EXTRA COST)

    // FIND AVAILABEL DRIVERS IN CLOSE PROXIMITY
    // const drivers = await DriverRide.find({
    //   pickupLocation: {
    //     $nearSphere: {
    //       $geometry: {
    //         type: "Point",
    //         coordinates: [
    //           parseFloat(passengerLongitude as any),
    //           parseFloat(passengerLatitude as any),
    //         ],
    //       },
    //       $maxDistance: 5000, // Maximum distance in meters (adjust as needed)
    //     },
    //   },
    // })
    // .populate("driver", "firstname")
    // .populate("passengers", "firstname");

    // PASSENGERS CAN SEARCH FOR RIDES BASED ON THE PICKUP LOCATION
    const { search } = req.query;

    if(!search){
      return res.status(404).json({ error: "No search parameter given. Ensure to give one." });
    }

    // Construct the case-insensitive regex pattern for the search query
    const searchPattern = new RegExp(search as string, "i");

    const drivers = await DriverRide.find({
      pickupLocation: { $regex: searchPattern },
    })
      .populate("driver", "firstname")
      .populate("passengers", "firstname")
      .populate("vehicle");

    // Format the response data
    const availableDrivers = drivers.map((driver) => {
      const {
        id,
        driver: driverId,
        passengers,
        seatsAvailable,
        price,
        vehicle,
      } = driver;

      // RETURN ANY PASSENGER THAT IS CURREN
      const passengerNames = passengers.map(
        (passenger: any) => passenger.firstname
      );

      return {
        id,
        driver: driverId,
        seatsAvailable,
        price,
        passengers: passengerNames,
        vehicle,
      };
    });

    res.status(200).json(availableDrivers);
  } catch (err: any) {
    console.error(err.message);
    res.status(500).json({ error: "Failed to retrieve available drivers" });
  }
};

// @route    GET api/passengers/requests
// @desc     Get all ride requests made by the passenger
// @access   Private (Passenger)
export const getAllRequests = async (req: AuthRequest, res: Response) => {
  try {
    const passengerId = req.user?.id;

    // Find all ride requests where the passenger's ID matches the 'passenger' field
    const requests = await PassengerRide.find({ passenger: passengerId });

    res.status(200).json(requests);
  } catch (error: any) {
    console.error(error.message);
    res.status(500).send("Server Error");
  }
};

// @route    GET api/passengers/requests/:requestId
// @desc     Get a specific ride request made by the passenger by requestId
// @access   Private (Passenger)
export const getRequestById = async (req: AuthRequest, res: Response) => {
  try {
    const passengerId = req.user?.id;
    const requestId = req.params.requestId;

    // Find the ride request where the passenger's ID matches the 'passenger' field and the request ID matches the provided request ID
    const request = await PassengerRide.findOne({
      _id: requestId,
      passenger: passengerId,
    });

    if (!request) {
      return res.status(404).json({ error: "Ride request not found" });
    }

    res.status(200).json(request);
  } catch (err: any) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

// PUT REQUESTS
// ---

// @route    PUT api/passengers/:rideId/requests/:requestId
// @desc     Update a ride request details
// @access   Private (Passenger)
export const updateRequest = async (req: AuthRequest, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { rideId, requestId } = req.params;

    const {
      pickupLocation,
      dropoffLocation,
      numberOfPassengers,
      price,
      ...updatedFields
    } = req.body;

    // Find the ride by rideId
    const ride = await DriverRide.findById(rideId);
    if (!ride) {
      return res.status(404).json({ error: "Ride not found" });
    }

    // Find the passenger ride request by requestId
    const passengerRide = await PassengerRide.findById(requestId);
    if (!passengerRide) {
      return res.status(404).json({ error: "Ride request not found" });
    }

    // Check if the user is the creator of the ride request
    if (passengerRide.passenger.toString() != req.user?.id) {
      return res
        .status(401)
        .json({ error: "Not authorized to update this ride request" });
    }

    // Update the ride request
    const updatedRequest = await PassengerRide.findByIdAndUpdate(
      {
        $set: {
          pickupLocation,
          dropoffLocation,
          numberOfPassengers,
          price,
          ...updatedFields,
        },
      },
      { new: true }
    );

    res
      .status(200)
      .json({ msg: "Ride request is successfully updated", updatedRequest });
  } catch (err: any) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

// @route    PUT api/passengers/:rideId/requests/:requestId
// @desc     Mark a ride request as completed
// @access   Private (Passenger)
export const completeRideRequest = async (req: AuthRequest, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { rideId, requestId } = req.params;
    const passengerId = req.user?.id;

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

    // CHECK IF THE PASSENGER RIDE REQUEST IS ALREADY COMPLETED
    if (passengerRide.status == "completed") {
      return res
        .status(400)
        .json({ error: "Ride request is already marked as completed" });
    }

    // CHECK IF THE PASSENGER RIDE REQUEST BELONGS TO THE AUTHENTICATED PASSENGER
    if (passengerRide.passenger.toString() != passengerId) {
      return res.status(401).json({
        error: "Not authorized to mark this ride request as completed",
      });
    }

    // UPDATE THE STATUS OF THE PASSENGER RIDE REQUEST TO "COMPLETED"
    passengerRide.status = "completed";
    await passengerRide.save();

    res.status(200).json({ message: "Ride request marked as completed" });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: "Failed to mark ride request as completed" });
  }
};

// DELETE REQUESTS

// @route    DELETE api/passengers/:rideId/requests/:requestId
// @desc     Delete a ride request
// @access   Private (Passenger)
export const deleteRequest = async (req: AuthRequest, res: Response) => {
  try {
    const passengerId = req.user?.id;
    const { rideId, requestId } = req.params;
    const ride = await DriverRide.findById(rideId);
    if (!ride) {
      return res.status(404).json({ error: "Ride requset not found" });
    }

    // FIND THE PASSENGER RIDE REQUEST BY REQUESTID
    const passengerRide = await PassengerRide.findById(requestId);
    if (!passengerRide) {
      return res.status(404).json({ error: "Ride request not found" });
    }

    // CHECK IF THE PASSENGER RIDE REQUEST BELONGS TO THE AUTHENTICATED PASSENGER
    if (passengerRide.passenger.toString() != passengerId) {
      return res.status(401).json({
        error: "Not authorized to delete this ride request",
      });
    }

    // Find the ride request where the passenger's ID matches the 'passenger' field and the request ID matches the provided request ID
    const request = await PassengerRide.findOneAndDelete({
      _id: requestId,
      passenger: passengerId,
    });

    res.status(200).json({ msg: "Ride request is successfully deleted" });
  } catch (err: any) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};
