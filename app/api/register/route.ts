import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    await connectDB();
    const { name, surname, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { message: "Le nom, l'email et le mot de passe sont requis" },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { message: "Le mot de passe doit contenir au moins 8 caractères" },
        { status: 400 }
      );
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { message: "Un compte existe déjà avec cet email" },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = new User({
      name,
      surname: surname ?? "",
      email,
      password: hashedPassword,
      isAdmin:  false, // ← jamais admin par défaut
    });

    await user.save();

    return NextResponse.json(
      { message: "Compte créé avec succès, vous pouvez vous connecter" },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Erreur serveur", error: String(error) },
      { status: 500 }
    );
  }
}