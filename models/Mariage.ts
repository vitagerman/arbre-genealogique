import mongoose, { Schema, Model } from "mongoose";

export interface IMariage {
  spouse1: mongoose.Types.ObjectId;
  spouse2: mongoose.Types.ObjectId;
  marriedAt?: Date;
  divorcedAt?: Date;
  createdAt: Date;
}

const MariageSchema = new Schema<IMariage>({
  spouse1: { type: Schema.Types.ObjectId, ref: "Person", required: true },
  spouse2: { type: Schema.Types.ObjectId, ref: "Person", required: true },
  marriedAt: { type: Date },
  divorcedAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
});

const Mariage: Model<IMariage> =
  mongoose.models.Mariage ||
  mongoose.model("Mariage", MariageSchema, "mariages");

export default Mariage;