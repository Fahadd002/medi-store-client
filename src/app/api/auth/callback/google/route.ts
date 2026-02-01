import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const origin = url.origin;
    const search = url.search; // includes leading '?', or empty

    // Redirect to homepage preserving query params so client can handle them
    const dest = `${origin}/${search}`;
    return NextResponse.redirect(dest);
  } catch (err) {
    return NextResponse.redirect("/");
  }
}
