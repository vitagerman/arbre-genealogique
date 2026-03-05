import mongoose, { Schema, Model } from "mongoose";

export interface IPerson {
  firstName: string;
  lastName?: string;
  birthdate?: Date;
  deathdate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const PersonSchema = new Schema<IPerson>({
  firstName: { type: String, required: true },
  lastName: { type: String },
  birthdate: { type: Date },
  deathdate: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const Person: Model<IPerson> =
  mongoose.models.Person || mongoose.model("Person", PersonSchema, "persons");

export default Person;