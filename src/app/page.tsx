import Link from 'next/link'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export default async function Home() {
  const cookieStore = await cookies()
  
  // Inicializando o Supabase no lado do servidor
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
      },
    }
  )

  // 1. Busca a rodada que está com o status 'aberta'
  const { data: rodada } = await supabase
    .from('rodadas')
    .select('*')
    .eq('status', 'aberta')
    .single()

  let participantes: any[] = []
  let poteAcumulado = 0

  if (rodada) {
    // 2. Busca todas as cartelas da rodada aberta, trazendo o nome do usuário
    const { data: cartelas } = await supabase
      .from('cartelas')
      .select('pago, valor_pago, usuarios(nome)')
      .eq('rodada_id', rodada.id)

    if (cartelas) {
      participantes = cartelas

      // 3. Calcula o total arrecadado somando apenas as cartelas pagas
      poteAcumulado = cartelas
        .filter((c) => c.pago)
        .reduce((acumulador, cartela) => acumulador + Number(cartela.valor_pago), 0)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center">
      
      {/* Cabeçalho / Hero Section */}
      <header className="w-full bg-blue-700 text-white py-16 px-4 text-center shadow-md">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-4 uppercase tracking-tight">
          Bolão Copa do Mundo 2026
        </h1>
        <p className="text-lg md:text-xl text-blue-100 max-w-2xl mx-auto mb-8">
          Faça seus palpites, acerte os placares da semana e concorra ao grande prêmio acumulado.
        </p>
        
        <Link 
          href="/login" 
          className="bg-yellow-400 text-blue-900 font-bold py-3 px-8 rounded-full text-lg hover:bg-yellow-300 transition-colors shadow-lg"
        >
          Participar Agora
        </Link>
      </header>

      <main className="w-full max-w-4xl px-4 py-12 flex flex-col gap-8">
        
        {/* Card do Pote Acumulado */}
        {rodada ? (
          <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center transform -translate-y-16">
            <h2 className="text-gray-500 font-semibold text-sm uppercase tracking-wider mb-2">
              {rodada.titulo}
            </h2>
            <p className="text-gray-900 font-bold text-2xl mb-4">Prêmio Acumulado</p>
            <div className="text-5xl font-extrabold text-green-600">
              R$ {poteAcumulado.toFixed(2).replace('.', ',')}
            </div>
            <p className="text-sm text-gray-400 mt-4">
              Valor da inscrição: R$ {Number(rodada.valor_inscricao).toFixed(2).replace('.', ',')}
            </p>
          </section>
        ) : (
          <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center transform -translate-y-16">
            <p className="text-gray-600 font-medium">Nenhuma rodada aberta no momento.</p>
          </section>
        )}

        {/* Lista de Participantes Pública */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gray-100 px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-bold text-gray-800">
              Participantes ({participantes.length})
            </h3>
          </div>
          
          {participantes.length > 0 ? (
            <ul className="divide-y divide-gray-100">
              {participantes.map((participante, index) => (
                <li key={index} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold">
                      {participante.usuarios.nome.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-medium text-gray-700">
                      {participante.usuarios.nome}
                    </span>
                  </div>
                  
                  <div>
                    {participante.pago ? (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Confirmado
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        Aguardando Pagamento
                      </span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-8 text-center text-gray-500">
              Seja o primeiro a participar desta rodada!
            </div>
          )}
        </section>

      </main>
    </div>
  )
}