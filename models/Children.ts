import mongoose, { Schema, Model } from "mongoose";

export interface IChild {
  child: mongoose.Types.ObjectId; // L’enfant
  parentsUnion: mongoose.Types.ObjectId; // L’union dans laquelle il est né
  createdAt: Date;
}

const ChildSchema = new Schema<IChild>({
  child: { type: Schema.Types.ObjectId, ref: "Person", required: true },
  parentsUnion: { type: Schema.Types.ObjectId, ref: "Mariage", required: true },
  createdAt: { type: Date, default: Date.now },
});

const Child: Model<IChild> =
  mongoose.models.Child || mongoose.model("Child", ChildSchema, "children");

export default Child;