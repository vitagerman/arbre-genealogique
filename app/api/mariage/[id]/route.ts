import { connectDB } from "@/lib/mongodb";
import Mariage from "@/models/Mariage";
import { NextResponse } from "next/server";

// DELETE : supprimer un mariage par ID
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { success: false, message: "ID manquant" },
        { status: 400 }
      );
    }

    const result = await Mariage.findByIdAndDelete(id);

    if (!result) {
      return NextResponse.json(
        { success: false, message: "Mariage non trouvé" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, message: "Mariage supprimé" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erreur DELETE /api/mariage/[id]:", error);
    return NextResponse.json(
      { success: false, message: "Erreur serveur", error: String(error) },
      { status: 500 }
    );
  }
}
