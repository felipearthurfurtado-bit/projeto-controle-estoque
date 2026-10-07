import type { Produto } from '../types';
import { textoParaNumero } from './utilitarios';

// Dados do formulário de produto (tudo em texto, antes da conversão).
export type ProdutoFormulario = {
  nome: string;
  descricao: string;
  preco: string;
  quantidade: string;
  estoqueMinimo: string;
  categoriaId: string;
};

// Mensagens de erro por campo do formulário.
export type ErrosProduto = Partial<Record<keyof ProdutoFormulario, string>>;

// Valida o formulário de produto e retorna as mensagens de erro.
// Regras: campos obrigatórios, números e valores positivos.
export function validarProduto(form: ProdutoFormulario): ErrosProduto {
  const erros: ErrosProduto = {};

  // Nome: obrigatório.
  if (!form.nome.trim()) {
    erros.nome = 'O nome é obrigatório.';
  }

  // Preço: obrigatório, número e maior que zero.
  if (!form.preco.trim()) {
    erros.preco = 'O preço é obrigatório.';
  } else if (Number.isNaN(textoParaNumero(form.preco))) {
    erros.preco = 'Informe um preço válido (ex.: 19,90).';
  } else if (textoParaNumero(form.preco) <= 0) {
    erros.preco = 'O preço deve ser maior que zero.';
  }

  // Quantidade: obrigatória, inteira e não negativa.
  if (!form.quantidade.trim()) {
    erros.quantidade = 'A quantidade é obrigatória.';
  } else if (!Number.isInteger(Number(form.quantidade))) {
    erros.quantidade = 'A quantidade deve ser um número inteiro.';
  } else if (Number(form.quantidade) < 0) {
    erros.quantidade = 'A quantidade não pode ser negativa.';
  }

  // Estoque mínimo: obrigatório, inteiro e não negativo.
  if (!form.estoqueMinimo.trim()) {
    erros.estoqueMinimo = 'O estoque mínimo é obrigatório.';
  } else if (!Number.isInteger(Number(form.estoqueMinimo))) {
    erros.estoqueMinimo = 'O estoque mínimo deve ser um número inteiro.';
  } else if (Number(form.estoqueMinimo) < 0) {
    erros.estoqueMinimo = 'O estoque mínimo não pode ser negativo.';
  }

  // Categoria: obrigatória (FK do produto).
  if (!form.categoriaId) {
    erros.categoriaId = 'A categoria é obrigatória.';
  }

  return erros;
}

// Converte o formulário validado na entidade Produto (sem o id).
export function converterFormulario(
  form: ProdutoFormulario,
): Omit<Produto, 'id'> {
  return {
    nome: form.nome.trim(),
    descricao: form.descricao.trim(),
    preco: textoParaNumero(form.preco),
    quantidade: Number(form.quantidade),
    estoqueMinimo: Number(form.estoqueMinimo),
    categoriaId: form.categoriaId,
  };
}

// Valida a quantidade digitada na movimentação.
// Retorna a mensagem de erro ou null quando está válida.
export function validarQuantidadeMovimentacao(texto: string): string | null {
  if (!texto.trim()) {
    return 'A quantidade é obrigatória.';
  }
  if (Number.isNaN(Number(texto))) {
    return 'Informe um número válido.';
  }
  if (!Number.isInteger(Number(texto))) {
    return 'A quantidade deve ser um número inteiro.';
  }
  if (Number(texto) <= 0) {
    return 'A quantidade deve ser maior que zero.';
  }
  return null;
}

// Valida o nome de uma categoria. Retorna a mensagem ou null.
export function validarNomeCategoria(texto: string): string | null {
  if (!texto.trim()) {
    return 'O nome é obrigatório.';
  }
  return null;
}
