'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function FormPalpites({ rodada, jogos, usuarioId }: any) {
  const router = useRouter()
  const [palpites, setPalpites] = useState<any>({})
  const [loading, setLoading] = useState(false)

  // Atualiza o estado quando o usuário digita os gols
  const handlePalpiteChange = (jogoId: string, time: 'A' | 'B', valor: string) => {
    setPalpites({
      ...palpites,
      [jogoId]: {
        ...palpites[jogoId],
        [time]: valor === '' ? '' : Number(valor)
      }
    })
  }

  // Envia os dados para a nossa rota de API
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const palpitesArray = jogos.map((jogo: any) => ({
      jogoId: jogo.id,
      golsA: palpites[jogo.id]?.A || 0,
      golsB: palpites[jogo.id]?.B || 0
    }))

    const res = await fetch('/api/palpitar', {
      method: 'POST',
      body: JSON.stringify({
        usuarioId,
        rodadaId: rodada.id,
        valorInscricao: rodada.valor_inscricao,
        palpites: palpitesArray
      }),
      headers: { 'Content-Type': 'application/json' }
    })

    if (res.ok) {
      // Recarrega a página para o Next.js buscar a nova cartela e exibir a tela de pagamento
      router.refresh() 
    } else {
      alert('Erro ao enviar palpites. Tente novamente.')
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <div className="mb-6 text-center">
        <h2 className="text-xl font-bold text-gray-800">{rodada.titulo}</h2>
        <p className="text-gray-500 text-sm mt-1">
          Valor da Inscrição: R$ {Number(rodada.valor_inscricao).toFixed(2).replace('.', ',')}
        </p>
      </div>

      <div className="space-y-6">
        {jogos.map((jogo: any) => (
          <div key={jogo.id} className="flex flex-col md:flex-row items-center justify-between p-4 bg-gray-50 rounded border border-gray-100">
            {/* Time A */}
            <div className="flex items-center gap-4 w-full md:w-1/3 justify-end">
              <span className="font-semibold text-gray-700">{jogo.time_a}</span>
              <input
                type="number"
                min="0"
                required
                className="w-16 h-12 text-center text-xl font-bold rounded border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                onChange={(e) => handlePalpiteChange(jogo.id, 'A', e.target.value)}
              />
            </div>

            <span className="text-gray-400 font-bold mx-4 py-2 md:py-0">X</span>

            {/* Time B */}
            <div className="flex items-center gap-4 w-full md:w-1/3 justify-start">
              <input
                type="number"
                min="0"
                required
                className="w-16 h-12 text-center text-xl font-bold rounded border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                onChange={(e) => handlePalpiteChange(jogo.id, 'B', e.target.value)}
              />
              <span className="font-semibold text-gray-700">{jogo.time_b}</span>
            </div>
          </div>
        ))}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="mt-8 w-full bg-green-600 text-white font-bold py-3 px-4 rounded hover:bg-green-700 transition disabled:opacity-50"
      >
        {loading ? 'Salvando palpites...' : 'Confirmar e Gerar Pagamento'}
      </button>
    </form>
  )
}