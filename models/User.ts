import mongoose, { Schema, Model } from "mongoose";

export interface IUser {
  name: string;
  surname: string;
  email: string;
  password: string;
  isAdmin: boolean;
  createdAt: Date;
}

const UserSchema = new Schema<IUser>({
  name:      { type: String, required: true },
  surname:   { type: String },
  email:     { type: String, required: true, unique: true },
  password:  { type: String, required: true },
  isAdmin:   { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

const User: Model<IUser> =
  mongoose.models.User || mongoose.model("User", UserSchema, "users");

export default User;