import type { Movimentacao, Produto, TipoMovimentacao } from '../types';
import { CHAVES, carregarLista, salvarLista } from '../storage/armazenamento';
import { criarId } from './utilitarios';
import { buscarProduto } from './produtosService';

// Lista todas as movimentações, mais recentes primeiro.
export async function listarMovimentacoes(): Promise<Movimentacao[]> {
  const movimentacoes =
    await carregarLista<Movimentacao>(CHAVES.movimentacoes);
  return movimentacoes.sort((a, b) => b.data.localeCompare(a.data));
}

// Lista apenas as movimentações de um produto (histórico do detalhe).
export async function listarMovimentacoesDoProduto(
  produtoId: string,
): Promise<Movimentacao[]> {
  const movimentacoes = await listarMovimentacoes();
  return movimentacoes.filter(
    (movimentacao) => movimentacao.produtoId === produtoId,
  );
}

// Registra uma entrada ou saída e atualiza a quantidade do produto.
export async function registrarMovimentacao(
  produtoId: string,
  tipo: TipoMovimentacao,
  quantidade: number,
): Promise<Movimentacao> {
  // Validações da quantidade.
  if (!Number.isInteger(quantidade)) {
    throw new Error('A quantidade deve ser um número inteiro.');
  }
  if (quantidade <= 0) {
    throw new Error('A quantidade deve ser maior que zero.');
  }

  // O produto precisa existir (FK).
  const produto = await buscarProduto(produtoId);
  if (!produto) {
    throw new Error('Produto não encontrado.');
  }

  // Regra principal: saída nunca pode ser maior que o estoque atual.
  if (tipo === 'saida' && quantidade > produto.quantidade) {
    throw new Error(
      `Saída não permitida: estoque insuficiente (disponível: ${produto.quantidade}).`,
    );
  }

  // Atualiza a quantidade do produto (entrada soma, saída subtrai).
  const produtos = await carregarLista<Produto>(CHAVES.produtos);
  const indice = produtos.findIndex((item) => item.id === produtoId);
  produtos[indice] = {
    ...produtos[indice],
    quantidade:
      tipo === 'entrada'
        ? produtos[indice].quantidade + quantidade
        : produtos[indice].quantidade - quantidade,
  };
  await salvarLista(CHAVES.produtos, produtos);

  // Cria o registro da movimentação com a data atual.
  const novaMovimentacao: Movimentacao = {
    id: criarId(),
    produtoId,
    tipo,
    quantidade,
    data: new Date().toISOString(),
  };

  const movimentacoes =
    await carregarLista<Movimentacao>(CHAVES.movimentacoes);
  movimentacoes.push(novaMovimentacao);
  await salvarLista(CHAVES.movimentacoes, movimentacoes);

  return novaMovimentacao;
}
