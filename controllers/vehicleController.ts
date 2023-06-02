import { Request, Response } from "express";
import { body, validationResult, Result } from "express-validator";
import User, { IUser } from "../models/User";
import Vehicle from "../models/Vehicle";

interface AuthRequest extends Request {
  user?: IUser;
}
// @route    POST api/vehicles
// @desc     Create a new vehicle
// @access   Private (Driver)
export const createVehicle = async (req: AuthRequest, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const {
      make,
      model,
      year,
      color,
      plateNumber,
      description,
      seats,
      avatar,
      available,
      location,
    } = req.body;

    // Check if the driver already has a vehicle (to avoid multiple people from only an account)
    const existingVehicle = await Vehicle.findOne({ driver: req.user?.id });

    if (existingVehicle) {
      return res.status(400).json({
        error:
          "Driver already has a vehicle. Update your vehicle if you need to",
      });
    }

    const driver = await User.findById(req.user?.id);

    // CHECK IF THE USER IS A DRIVER 
    if (driver?.role != "driver") {
      return res.status(404).json({ msg: "Only a drive can create a vehicle" });
    }

    // Create a new vehicle
    const vehicle = new Vehicle({
      driver: req.user?.id,
      make,
      model,
      year,
      color,
      plateNumber,
      description,
      seats,
      avatar,
      available,
      location,
    });

    // Save the vehicle
    await vehicle.save();

    res.status(200).json(vehicle);
  } catch (err: any) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

// @route    GET api/vehicles
// @desc     Get vehicle of a driver
// @access   Private (Driver)
export const getDriverVehicle = async (req: AuthRequest, res: Response) => {
  try {
    // Find the vehicle of the driver
    const vehicle = await Vehicle.findOne({ driver: req.user?.id });
    if (!vehicle) {
      return res.status(404).json({ error: "No vehicle" });
    }
    res.json(vehicle);
  } catch (err: any) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};
