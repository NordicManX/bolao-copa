import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import FormPalpites from '@/components/FormPalpites'

export default async function Dashboard() {
  const cookieStore = await cookies()

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

  // 1. Busca quem é o usuário logado
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // 2. Busca a cartela do usuário
  const { data: cartela } = await supabase
    .from('cartelas')
    .select('*')
    .eq('usuario_id', user.id)
    .single()

  // Se o usuário NÃO tem cartela, ele precisa fazer os palpites
  if (!cartela) {
    const { data: rodada } = await supabase
      .from('rodadas')
      .select('*')
      .eq('status', 'aberta')
      .single()

    if (!rodada) {
      return (
        <div className="p-8 text-center mt-10">
          <h1 className="text-2xl font-bold mb-4">Aguarde!</h1>
          <p className="text-gray-600">Nenhuma rodada de palpites está aberta no momento.</p>
        </div>
      )
    }

    const { data: jogos } = await supabase
      .from('jogos')
      .select('*')
      .eq('rodada_id', rodada.id)
      .order('data_jogo', { ascending: true })

    return (
      <div className="p-8 max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-center mb-8">Faça seus palpites</h1>
        <FormPalpites rodada={rodada} jogos={jogos} usuarioId={user.id} />
      </div>
    )
  }

  // 3. Regra de bloqueio de pagamento (A PARTE QUE FALTAVA)
  if (!cartela.pago) {
    return (
      <div className="p-8 text-center max-w-md mx-auto mt-10 border border-gray-200 rounded-lg shadow-sm bg-white">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Pagamento Pendente</h1>
        <p className="mb-6 text-gray-600">
          Para liberar a visualização dos seus palpites e participar do bolão da semana, realize o pagamento.
        </p>
        <div className="bg-gray-50 p-6 rounded-lg text-left border border-gray-100">
          <p className="text-lg text-gray-700">Valor: <strong className="text-black">R$ {cartela.valor_pago}</strong></p>
          <p className="text-lg mt-3 text-gray-700">Chave PIX: <strong className="text-black block mt-1">{process.env.NEXT_PUBLIC_CHAVE_PIX}</strong></p>
        </div>
        <p className="mt-6 text-sm text-gray-400">
          Seu acesso será liberado assim que o administrador confirmar o recebimento.
        </p>
      </div>
    )
  }

  // 4. Tela liberada
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-green-600 mb-2">Inscrição Confirmada!</h1>
      <p className="text-gray-600 mb-8">Boa sorte! Aqui estão os seus palpites para esta rodada.</p>
      
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Aqui renderizaremos os jogos mais pra frente */}
      </div>
    </div>
  )
}