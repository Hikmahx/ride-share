import { Document, Schema, model } from "mongoose";

const driverRideSchema = new Schema(
  {
    passengers: [{ type: Schema.Types.ObjectId, ref: "PassengerRide"}], 
    driver: { type: Schema.Types.ObjectId, ref: "User" },
    vehicle: { type: Schema.Types.ObjectId, ref: "Vehicle" },
    pickupLocation: { type: String, required: true },
    dropoffLocation: { type: String, required: true },
    seatsAvailable: {
      type: Number,
      required: true,   
    },
    price: { type: Number, required: true },
  },
  { timestamps: true }
);

const DriverRide = model("DriverRide", driverRideSchema);

export default DriverRide;
