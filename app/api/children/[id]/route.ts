import { connectDB } from "@/lib/mongodb";
import Child from "@/models/Children";
import { NextResponse } from "next/server";

// DELETE : supprimer un enfant par ID
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

    const result = await Child.findByIdAndDelete(id);

    if (!result) {
      return NextResponse.json(
        { success: false, message: "Enfant non trouvé" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, message: "Enfant supprimé" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erreur DELETE /api/children/[id]:", error);
    return NextResponse.json(
      { success: false, message: "Erreur serveur", error: String(error) },
      { status: 500 }
    );
  }
}
