/*import mongoose, { Schema, Model } from "mongoose";

export interface IChild {
  child: mongoose.Types.ObjectId; // L’enfant
  parentsUnion: mongoose.Types.ObjectId; // L’union dans laquelle il est né
  createdAt: Date;
}

const ChildSchema = new Schema<IChild>({
  child: { type: Schema.Types.ObjectId, ref: "People", required: true },
  parentsUnion: { type: Schema.Types.ObjectId, ref: "Marriage", required: true },
  createdAt: { type: Date, default: Date.now },
});

const Child: Model<IChild> =
  mongoose.models.Child || mongoose.model("Child", ChildSchema, "children");

export default Child;*/
import { connectDB } from "@/lib/mongodb";
import Child from "@/models/Children";
import { NextResponse } from "next/server";


// GET : récupérer tous les enfants
// GET : récupérer tous les enfants
export async function GET() {
  try {
    await connectDB();

    const children = await Child.find()
      .populate("child", "firstName lastName")
      .populate("parentsUnion", "spouse1 spouse2")
      .sort({ createdAt: -1 })
      .lean();

    // Toujours retourner un objet avec data
    return NextResponse.json({ success: true, data: children }, { status: 200 });

  } catch (error) {
    console.error("Erreur GET /api/children:", error);
    return NextResponse.json(
      { success: false, message: "Erreur serveur", error: String(error) },
      { status: 500 }
    );
  }
}

// POST : créer un enfant
export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    const { child, parentsUnion } = body;
    if (!child || !parentsUnion) {
      return NextResponse.json(
        { message: "L'enfant et l'union des parents sont requis" },
        { status: 400 }
      );
    }
    const newChild = new Child({ child, parentsUnion });
    await newChild.save();
    return NextResponse.json(
      { message: "Enfant créé", _id: newChild._id.toString() },
      { status: 201 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Erreur serveur" },
      { status: 500 }
    );
  }
}

// DELETE : supprimer tous les enfants
export async function DELETE() {
  try {
    await connectDB();
    await Child.deleteMany({});
    return NextResponse.json({ message: "Tous les enfants ont été supprimés" }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}