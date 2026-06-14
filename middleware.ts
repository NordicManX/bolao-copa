import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  // Cria a resposta inicial que pode ser modificada caso os cookies precisem ser atualizados
  let supabaseResponse = NextResponse.next({
    request,
  });

  // Inicializa o cliente do Supabase SSR
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // Atualiza os cookies da requisição e da resposta simultaneamente
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // Verifica se o usuário está logado de forma segura no servidor
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Mapeamento das rotas
  const isAuthRoute = request.nextUrl.pathname.startsWith("/login");
  const isProtectedRoute =
    request.nextUrl.pathname.startsWith("/dashboard") ||
    request.nextUrl.pathname.startsWith("/admin");

  // Se não estiver logado e tentar acessar área restrita, manda pro login
  if (!user && isProtectedRoute) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Se já estiver logado e tentar acessar a tela de login, manda pro painel
  if (user && isAuthRoute) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return supabaseResponse;
}

export const config = {
  // Ignora arquivos estáticos (imagens, favicon, etc) para o middleware não rodar neles sem necessidade
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
