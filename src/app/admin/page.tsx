import { supabase } from '@/lib/supabase'

export default async function AdminPanel() {
  const { data: cartelasPendentes } = await supabase
    .from('cartelas')
    .select('id, valor_pago, usuario_id, usuarios(nome)')
    .eq('pago', false)

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Painel Administrativo</h1>
      <h2 className="text-xl font-semibold mb-4">Aguardando Pagamento</h2>
      
      <div className="border rounded">
        {cartelasPendentes?.map((cartela) => (
          <div key={cartela.id} className="p-4 border-b flex justify-between items-center">
            <div>
              <p className="font-bold">{cartela.usuarios?.nome}</p>
              <p className="text-gray-600">R$ {cartela.valor_pago}</p>
            </div>
            <form action="/api/aprovar" method="POST">
              <input type="hidden" name="cartelaId" value={cartela.id} />
              <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
                Confirmar Pagamento
              </button>
            </form>
          </div>
        ))}
      </div>
    </div>
  )
}