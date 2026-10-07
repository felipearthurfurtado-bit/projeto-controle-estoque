import type { Categoria, Produto } from '../types';
import { CHAVES, carregarLista, salvarLista } from '../storage/armazenamento';
import { criarId } from './utilitarios';

// Lista todas as categorias ordenadas por nome.
export async function listarCategorias(): Promise<Categoria[]> {
  const categorias = await carregarLista<Categoria>(CHAVES.categorias);
  return categorias.sort((a, b) => a.nome.localeCompare(b.nome));
}

// Cadastra uma nova categoria com validação de nome.
export async function salvarCategoria(nome: string): Promise<Categoria> {
  const nomeLimpo = nome.trim();

  if (!nomeLimpo) {
    throw new Error('O nome é obrigatório.');
  }

  const categorias = await listarCategorias();

  // Regra: não pode haver duas categorias com o mesmo nome.
  const nomeExiste = categorias.some(
    (categoria) => categoria.nome.toLowerCase() === nomeLimpo.toLowerCase(),
  );
  if (nomeExiste) {
    throw new Error('Já existe uma categoria com esse nome.');
  }

  const novaCategoria: Categoria = { id: criarId(), nome: nomeLimpo };
  categorias.push(novaCategoria);
  await salvarLista(CHAVES.categorias, categorias);
  return novaCategoria;
}

// Exclui uma categoria (bloqueada se houver produtos usando-a).
export async function excluirCategoria(id: string): Promise<void> {
  const categorias = await listarCategorias();
  const restantes = categorias.filter((categoria) => categoria.id !== id);

  if (restantes.length === categorias.length) {
    throw new Error('Categoria não encontrada.');
  }

  // Regra de integridade: categoria com produtos não pode ser excluída (FK).
  const produtos = await carregarLista<Produto>(CHAVES.produtos);
  if (produtos.some((produto) => produto.categoriaId === id)) {
    throw new Error(
      'Não é possível excluir: existem produtos nesta categoria.',
    );
  }

  await salvarLista(CHAVES.categorias, restantes);
}
