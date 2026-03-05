import mongoose, { Schema, Model } from "mongoose";

export interface ICity {
  name: string;
  temperature: number;
  description: string;
  createdAt: Date;
}

const CitySchema = new Schema<ICity>({
  name:        { type: String, required: true },
  temperature: { type: Number, required: true },
  description: { type: String, required: true },
  createdAt:   { type: Date, default: Date.now },
});

const City: Model<ICity> =
  mongoose.models.City ||
  mongoose.model("City", CitySchema, "cities"); // ← "cities" = nom exact de ta collection

export default City;