import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request: Request) {
  const { rodadaId } = await request.json();

  const { data: jogos } = await supabase
    .from("jogos")
    .select("*")
    .eq("rodada_id", rodadaId);

  const { data: palpites } = await supabase
    .from("palpites")
    .select(
      "id, cartela_id, jogo_id, gols_palpite_a, gols_palpite_b, cartelas(rodada_id)",
    )
    .eq("cartelas.rodada_id", rodadaId);

  if (!jogos || !palpites)
    return NextResponse.json(
      { error: "Dados não encontrados" },
      { status: 404 },
    );

  const acertosPorCartela: Record<string, number> = {};

  palpites.forEach((palpite) => {
    const jogoReal = jogos.find((j) => j.id === palpite.jogo_id);

    if (
      jogoReal &&
      jogoReal.gols_real_a !== null &&
      jogoReal.gols_real_b !== null
    ) {
      const acertou =
        palpite.gols_palpite_a === jogoReal.gols_real_a &&
        palpite.gols_palpite_b === jogoReal.gols_real_b;

      if (acertou) {
        acertosPorCartela[palpite.cartela_id] =
          (acertosPorCartela[palpite.cartela_id] || 0) + 1;
      }
    }
  });

  for (const [cartelaId, totalAcertos] of Object.entries(acertosPorCartela)) {
    await supabase
      .from("cartelas")
      .update({ total_acertos: totalAcertos })
      .eq("id", cartelaId);
  }

  return NextResponse.json({
    success: true,
    message: "Rodada atualizada com sucesso",
  });
}
