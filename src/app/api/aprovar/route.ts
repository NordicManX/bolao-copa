import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request: Request) {
  const formData = await request.formData();
  const cartelaId = formData.get("cartelaId");

  if (!cartelaId) {
    return NextResponse.json({ error: "ID ausente" }, { status: 400 });
  }

  const { error } = await supabase
    .from("cartelas")
    .update({ pago: true })
    .eq("id", cartelaId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.redirect(new URL("/admin", request.url));
}
