// Entidades do banco de dados e definição das rotas do app.
// Relações: Categoria 1—N Produto; Produto 1—N Movimentacao.

// Categoria (tabela categoria)
export type Categoria = {
  id: string; // PK
  nome: string;
};

// Produto (tabela produto)
export type Produto = {
  id: string; // PK
  nome: string;
  descricao: string;
  preco: number;
  quantidade: number;
  estoqueMinimo: number;
  categoriaId: string; // FK -> Categoria.id
};

// Tipo de movimentação de estoque.
export type TipoMovimentacao = 'entrada' | 'saida';

// Movimentação (tabela movimentacao)
export type Movimentacao = {
  id: string; // PK
  produtoId: string; // FK -> Produto.id
  tipo: TipoMovimentacao;
  quantidade: number;
  data: string; // data no formato ISO (ex.: 2026-10-07T14:30:00)
};

// Parâmetros das telas da pilha principal (stack).
export type RootStackParamList = {
  Abas: undefined;
  FormProduto: { produtoId?: string } | undefined;
  DetalhesProduto: { produtoId: string };
  NovaMovimentacao: { produtoId?: string } | undefined;
};

// Parâmetros das abas inferiores (tabs).
export type AbasParamList = {
  Inicio: undefined;
  Produtos: undefined;
  Categorias: undefined;
  Movimentacoes: undefined;
};
