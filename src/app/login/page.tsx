'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [nome, setNome] = useState('')
  const [isLogin, setIsLogin] = useState(true)
  const router = useRouter()

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()

    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (!error) {
        // Atualiza os componentes do servidor para lerem o novo cookie
        router.refresh()
        router.push('/dashboard')
      } else {
        alert('Erro ao fazer login')
      }
    } else {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      })
      if (data.user && !error) {
        await supabase.from('usuarios').insert({
          id: data.user.id,
          nome: nome,
        })
        router.refresh()
        router.push('/dashboard')
      } else {
        alert('Erro ao criar conta')
      }
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded shadow">
        <h2 className="text-center text-3xl font-extrabold text-gray-900">
          {isLogin ? 'Acessar Bolão' : 'Criar Conta'}
        </h2>
        <form className="mt-8 space-y-6" onSubmit={handleAuth}>
          <div className="rounded-md shadow-sm space-y-4">
            {!isLogin && (
              <input
                type="text"
                required
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="appearance-none rounded w-full px-3 py-2 border border-gray-300 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Seu Nome Completo"
              />
            )}
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="appearance-none rounded w-full px-3 py-2 border border-gray-300 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Email"
            />
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="appearance-none rounded w-full px-3 py-2 border border-gray-300 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Senha"
            />
          </div>

          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
          >
            {isLogin ? 'Entrar' : 'Cadastrar'}
          </button>
        </form>
        
        <div className="text-center mt-4">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-sm text-blue-600 hover:text-blue-500"
          >
            {isLogin ? 'Não tem conta? Cadastre-se' : 'Já tem conta? Entre'}
          </button>
        </div>
      </div>
    </div>
  )
}