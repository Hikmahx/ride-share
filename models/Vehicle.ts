import { Schema, model, Document } from "mongoose";

interface IVehicle extends Document {
  make: string;
  model: string;
  color: string;
  year: number;
  plateNumber: string;
  description: string;
  seats: number;
  avatar: string;
  driver: Schema.Types.ObjectId,
  // defaultVehicle: boolean;
  available:boolean,
  location: {
    type: { type: string };
    coordinates: number[];
  };
}

const vehicleSchema = new Schema<IVehicle>({
  make: { type: String, required: true },
  model: { type: String, required: true },
  color: { type: String, required: true },
  year: { type: Number},
  plateNumber: { type: String, required: true, unique: true },
  description: { type: String },
  seats: { type: Number, required: true },
  avatar: { type: String },
  driver: { type: Schema.Types.ObjectId, ref: "User" },
  // defaultVehicle: {type: Boolean, default: false},
  available: {type: Boolean, required:true},
  location: {
    type: {
      type: String,
      enum: ["Point"],
      required: true,
    },
    coordinates: {
      type: [Number],
      required: true,
    },
  }
});

const Vehicle = model<IVehicle>("Vehicle", vehicleSchema);

export default Vehicle;
