import { NextResponse } from "next/server";
import { registerUser } from "@/lib/auth-utils";

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const user = await registerUser(body);

    return NextResponse.json(
      { message: "User created successfully", user },
      { status: 201 }
    );
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "User with this email already exists") {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500 }
    );
  }
}
