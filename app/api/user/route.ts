import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";

// GET : lister tous les utilisateurs
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ message: "Accès refusé" }, { status: 403 });
    }

    await connectDB();
    const users = await User.find({}, { password: 0 })
      .sort({ createdAt: -1 })
      .lean();

    const plainUsers = users.map((u) => ({
      ...u,
      _id:       u._id.toString(),
      createdAt: u.createdAt.toISOString(),
    }));

    return NextResponse.json({ success: true, data: plainUsers });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}

// POST : créer un utilisateur depuis l'interface admin
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ message: "Accès refusé" }, { status: 403 });
    }

    await connectDB();
    const { name, surname, email, password, isAdmin } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ message: "Champs manquants" }, { status: 400 });
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
      surname:  surname ?? "",
      email,
      password: hashedPassword,
      isAdmin:  isAdmin ?? false,
    });

    await user.save();

    return NextResponse.json(
      {
        message: "Utilisateur créé",
        user: {
          _id:     user._id.toString(),
          name:    user.name,
          email:   user.email,
          isAdmin: user.isAdmin,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}

// PUT : modifier les droits d'un utilisateur
export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ message: "Accès refusé" }, { status: 403 });
    }

    await connectDB();
    const { userId, isAdmin } = await req.json();

    if (!userId) {
      return NextResponse.json({ message: "userId requis" }, { status: 400 });
    }

    if (userId === session.user.id) {
      return NextResponse.json(
        { message: "Vous ne pouvez pas modifier votre propre compte" },
        { status: 400 }
      );
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { isAdmin },
      { new: true, projection: { password: 0 } }
    );

    if (!updatedUser) {
      return NextResponse.json(
        { message: "Utilisateur non trouvé" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: updatedUser });
  } catch (error) {
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}

// DELETE : supprimer un utilisateur
export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ message: "Accès refusé" }, { status: 403 });
    }

    await connectDB();
    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json({ message: "userId requis" }, { status: 400 });
    }

    if (userId === session.user.id) {
      return NextResponse.json(
        { message: "Vous ne pouvez pas supprimer votre propre compte" },
        { status: 400 }
      );
    }

    const deleted = await User.findByIdAndDelete(userId);
    if (!deleted) {
      return NextResponse.json(
        { message: "Utilisateur non trouvé" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, message: "Utilisateur supprimé" }
    );
  } catch (error) {
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}