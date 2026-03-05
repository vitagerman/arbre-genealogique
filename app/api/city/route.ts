import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import City from "@/models/City";

export async function GET() {
  try {
    await connectDB();
    const cities = await City.find().sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: cities });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { name, country } = await request.json();
    await connectDB();
    const newCity = new City({ name, country });
    await newCity.save();
    return NextResponse.json({ success: true, data: newCity }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}