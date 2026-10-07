// Funções auxiliares compartilhadas pelos services.

// Gera um id único simples para cada registro (PK).
export function criarId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

// Converte texto de preço (aceita vírgula) em número: "19,90" -> 19.9
export function textoParaNumero(texto: string): number {
  return Number(texto.trim().replace(',', '.'));
}
