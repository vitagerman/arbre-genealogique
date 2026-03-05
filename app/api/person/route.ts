// app/api/people/route.ts
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import People from "@/models/Person";

// GET : récupérer toutes les personnes
export async function GET() {
  try {
    await connectDB();

    const people = await People.find().sort({ createdAt: -1 }).lean();

    // convertir ObjectId en string et date en ISO
    const plainPeople = people.map((p) => ({
      ...p,
      _id: p._id.toString(),
      createdAt: p.createdAt.toISOString(),
    }));

    return NextResponse.json({ success: true, data: plainPeople });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}

// POST : créer une personne
export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    const { firstName, lastName, deathdate, birthdate } = body;

    if (!firstName) {
      return NextResponse.json(
        { message: "Le prénom est requis" },
        { status: 400 }
      );
    }

    const person = new People({ firstName, lastName, deathdate, birthdate });
    await person.save();

    return NextResponse.json(
      {
        _id: person._id.toString(),
        firstName: person.firstName,
        lastName: person.lastName ?? null,
        birthdate: person.birthdate ? person.birthdate.toISOString() : null,
        deathdate: person.deathdate ? person.deathdate.toISOString() : null,
        createdAt: person.createdAt.toISOString(),
      },
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


// PUT : mettre à jour une personne
export async function PUT(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    const { _id, firstName, lastName, deathdate, birthdate } = body;
    if (!_id) {
      return NextResponse.json(
        { message: "L'ID de la personne est requis" },
        { status: 400 }
      );
    }
    const updatedPerson = await People.findByIdAndUpdate(
      _id,
      { firstName, lastName, deathdate, birthdate },
      { new: true }
    );
    if (!updatedPerson) {
      return NextResponse.json(
        { message: "Personne non trouvée" },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { message: "Personne mise à jour", data: updatedPerson },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Erreur serveur" },
      { status: 500 }
    );
  }
}