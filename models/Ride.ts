import { Document, Schema, model } from "mongoose";

const rideSchema = new Schema(
  {
    passengers: [{ type: Schema.Types.ObjectId, ref: "User", required: true }],
    driver: { type: Schema.Types.ObjectId, ref: "User" },
    pickupLocation: { type: String, required: true },
    dropoffLocation: { type: String, required: true },
    numberOfPassengers: {
      type: Number,
      required: true,
    },
    seatsAvailable: {
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

const Ride = model("Ride", rideSchema);

export default Ride;
