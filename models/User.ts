import { Schema, model, Document } from "mongoose";

interface IUser extends Document {
  firstname: string;
  lastname: string;
  email: string;
  phone_number: string;
  password: string;
  role: "passenger" | "driver" | "admin";
  number: number;
  verified: boolean;
  location: any;
  plateNumber?: string;
  car?: string;
}
const userSchema = new Schema<IUser>(
  {
    firstname: { type: String, required: true },
    lastname: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone_number: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["passenger", "driver", "admin"],
      default: "passenger",
    },
    number: { type: Number, required: true },
    verified: { type: Boolean, required: true, default: false },
    location: {},
    plateNumber: {
      type: String,
      required: function (this: IUser) {
        return this.role === "driver";
      },
    },
    car: {
      type: String,
      required: function (this: IUser) {
        return this.role === "driver";
      },
    },
  },
  { timestamps: true }
);
userSchema.index({ location: "2dsphere" });

const User = model<IUser>("User", userSchema);

export default User;
