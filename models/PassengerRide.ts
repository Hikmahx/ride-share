import { Document, Schema, model } from "mongoose";

const passengerRideSchema = new Schema(
  {
    passenger: { type: Schema.Types.ObjectId, ref: "User", required: true }, 
    driver: { type: Schema.Types.ObjectId, ref: "User" },
    ride: {type: Schema.Types.ObjectId, ref: "DriverRide" },
    pickupLocation: { type: String, required: true },
    dropoffLocation: { type: String, required: true },
    numberOfPassengers: {
      type: Number,
      required: true,
    },
    price: { type: Number, required: true },
    status: {
      type: String,
      enum: ["requested", "accepted", "completed", "cancelled"],
      default: "requested",
    },
  },
  { timestamps: true }
);

const PassengerRide = model("PassengerRide", passengerRideSchema);

export default PassengerRide;
