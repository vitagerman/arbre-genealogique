import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Marriage from "@/models/Mariage";

export async function GET() {
  try {
    await connectDB();
    const marriages = await Marriage.find()
      .populate("spouse1", "firstName lastName")
      .populate("spouse2", "firstName lastName")
      .sort({ createdAt: -1 })
      .lean();
      
    return NextResponse.json({ success: true, data: marriages });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    const { spouse1, spouse2, marriedAt } = body;

    if (!spouse1 || !spouse2) {
      return NextResponse.json(
        { message: "Les deux conjoints sont requis" },
        { status: 400 }
      );
    }

    const marriage = new Marriage({ spouse1, spouse2, marriedAt });
    await marriage.save();
    return NextResponse.json(
      { message: "Mariage créé", _id: marriage._id.toString() },
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

export async function DELETE() {
    try {
        await connectDB();
        await Marriage.deleteMany({});
        return NextResponse.json({ message: "Tous les mariages ont été supprimés" }, { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
    }
}
