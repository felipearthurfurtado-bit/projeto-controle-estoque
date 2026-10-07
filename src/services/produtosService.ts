import type { Movimentacao, Produto } from '../types';
import { CHAVES, carregarLista, salvarLista } from '../storage/armazenamento';
import { criarId } from './utilitarios';
import type { ErrosProduto, ProdutoFormulario } from './validacaoService';
import { converterFormulario, validarProduto } from './validacaoService';

// Lista todos os produtos.
export async function listarProdutos(): Promise<Produto[]> {
  return carregarLista<Produto>(CHAVES.produtos);
}

// Busca um produto pelo id. Retorna null se não existir.
export async function buscarProduto(id: string): Promise<Produto | null> {
  const produtos = await listarProdutos();
  return produtos.find((produto) => produto.id === id) ?? null;
}

// Valida o formulário sem salvar. Retorna os erros por campo.
export function validarFormularioProduto(
  form: ProdutoFormulario,
): ErrosProduto {
  return validarProduto(form);
}

// Cadastra ou edita um produto (edição quando produtoId é informado).
export async function salvarProduto(
  form: ProdutoFormulario,
  produtoId?: string,
): Promise<Produto> {
  // Bloqueia a gravação quando o formulário é inválido.
  const erros = validarProduto(form);
  if (Object.keys(erros).length > 0) {
    throw new Error('Corrija os campos inválidos antes de salvar.');
  }

  const produtos = await listarProdutos();
  const dados = converterFormulario(form);

  // Edição: atualiza o produto existente.
  if (produtoId) {
    const indice = produtos.findIndex(
      (produto) => produto.id === produtoId,
    );
    if (indice === -1) {
      throw new Error('Produto não encontrado para edição.');
    }
    const atualizado: Produto = { ...produtos[indice], ...dados };
    produtos[indice] = atualizado;
    await salvarLista(CHAVES.produtos, produtos);
    return atualizado;
  }

  // Cadastro: cria um novo produto com id (PK).
  const novoProduto: Produto = { id: criarId(), ...dados };
  produtos.push(novoProduto);
  await salvarLista(CHAVES.produtos, produtos);
  return novoProduto;
}

// Exclui o produto e também o seu histórico de movimentações.
export async function excluirProduto(produtoId: string): Promise<void> {
  const produtos = await listarProdutos();
  const restantes = produtos.filter((produto) => produto.id !== produtoId);

  if (restantes.length === produtos.length) {
    throw new Error('Produto não encontrado.');
  }
  await salvarLista(CHAVES.produtos, restantes);

  // Integridade dos dados: apaga as movimentações órfãs do produto.
  const movimentacoes =
    await carregarLista<Movimentacao>(CHAVES.movimentacoes);
  const movimentacoesRestantes = movimentacoes.filter(
    (movimentacao) => movimentacao.produtoId !== produtoId,
  );
  await salvarLista(CHAVES.movimentacoes, movimentacoesRestantes);
}
