const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export function obterToken() {
  return localStorage.getItem('horta_token');
}

export function obterUsuarioLogado() {
  try {
    const salvo = localStorage.getItem('horta_usuario');
    return salvo ? JSON.parse(salvo) : null;
  } catch {
    return null;
  }
}

export function salvarSessao(token, usuario) {
  localStorage.setItem('horta_token', token);
  localStorage.setItem('horta_usuario', JSON.stringify(usuario));
}

export function limparSessao() {
  localStorage.removeItem('horta_token');
  localStorage.removeItem('horta_usuario');
}

export async function requisicao(endpoint, opcoes = {}) {
  const token = obterToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(opcoes.headers || {}),
  };

  let resposta;
  try {
    resposta = await fetch(`${API_URL}${endpoint}`, {
      ...opcoes,
      headers,
    });
  } catch {
    throw new Error(
      `Não foi possível conectar ao Backend (${API_URL}). Verifique se o servidor backend está rodando (npm run dev na pasta backend).`
    );
  }

  if (resposta.status === 204) return null;

  const dados = await resposta.json().catch(() => ({}));

  if (!resposta.ok) {
    throw new Error(dados.erro || 'Erro ao comunicar com o servidor.');
  }

  return dados;
}
