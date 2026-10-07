import AsyncStorage from '@react-native-async-storage/async-storage';

// Chaves usadas para guardar cada lista no armazenamento local.
export const CHAVES = {
  categorias: '@controle-estoque/categorias',
  produtos: '@controle-estoque/produtos',
  movimentacoes: '@controle-estoque/movimentacoes',
};

// Lê uma lista salva no AsyncStorage.
// Retorna lista vazia se ainda não houver dados.
export async function carregarLista<T>(chave: string): Promise<T[]> {
  try {
    const bruto = await AsyncStorage.getItem(chave);
    if (!bruto) {
      return [];
    }
    return JSON.parse(bruto) as T[];
  } catch {
    // Mensagem clara quando algo falhar na leitura.
    throw new Error('Não foi possível carregar os dados salvos.');
  }
}

// Salva a lista inteira no AsyncStorage.
export async function salvarLista<T>(chave: string, lista: T[]): Promise<void> {
  try {
    await AsyncStorage.setItem(chave, JSON.stringify(lista));
  } catch {
    // Mensagem clara quando algo falhar na gravação.
    throw new Error('Não foi possível salvar os dados.');
  }
}
