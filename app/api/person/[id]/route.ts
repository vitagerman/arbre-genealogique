import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import People from "@/models/Person";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params; // ← await
    const body = await req.json();
    const { firstName, lastName, deathdate, birthdate } = body;

    const updatedPerson = await People.findByIdAndUpdate(
      id,
      { firstName, lastName, deathdate, birthdate },
      { new: true }
    );

    if (!updatedPerson) {
      return NextResponse.json({ message: "Personne non trouvée" }, { status: 404 });
    }

    return NextResponse.json({ message: "Personne mise à jour", data: updatedPerson }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Erreur serveur", error: String(error) }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params; // ← await

    const deletedPerson = await People.findByIdAndDelete(id);

    if (!deletedPerson) {
      return NextResponse.json({ message: "Personne non trouvée" }, { status: 404 });
    }

    return NextResponse.json({ message: "Personne supprimée", success: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Erreur serveur", error: String(error) }, { status: 500 });
  }
}