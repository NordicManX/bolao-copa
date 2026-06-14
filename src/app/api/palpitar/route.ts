import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request: Request) {
  const body = await request.json();
  const { usuarioId, rodadaId, valorInscricao, palpites } = body;

  const { data: cartela, error: cartelaError } = await supabase
    .from("cartelas")
    .insert({
      usuario_id: usuarioId,
      rodada_id: rodadaId,
      pago: false,
      valor_pago: valorInscricao,
    })
    .select()
    .single();

  if (cartelaError || !cartela) {
    return NextResponse.json(
      { error: "Erro ao gerar cartela" },
      { status: 500 },
    );
  }

  const palpitesFormatados = palpites.map((p: any) => ({
    cartela_id: cartela.id,
    jogo_id: p.jogoId,
    gols_palpite_a: p.golsA,
    gols_palpite_b: p.golsB,
  }));

  const { error: palpitesError } = await supabase
    .from("palpites")
    .insert(palpitesFormatados);

  if (palpitesError) {
    return NextResponse.json(
      { error: "Erro ao salvar palpites" },
      { status: 500 },
    );
  }

  return NextResponse.json({ success: true, cartelaId: cartela.id });
}
