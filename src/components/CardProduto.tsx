import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

import { tema } from '../styles/theme';
import type { Produto } from '../types';

type Props = {
  produto: Produto;
  categoriaNome?: string; // nome da categoria (FK resolvida)
  onPress?: () => void;
};

// Formata o preço no padrão brasileiro: R$ 1234,50
function formatarPreco(valor: number): string {
  return `R$ ${valor.toFixed(2).replace('.', ',')}`;
}

// Cartão reutilizável de produto.
// Usado na Lista de Produtos e no Início (estoque baixo).
export default function CardProduto({ produto, categoriaNome, onPress }: Props) {
  // Regra de alerta: quantidade atual menor ou igual ao estoque mínimo.
  const estoqueBaixo = produto.quantidade <= produto.estoqueMinimo;

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={0.85}
    >
      {/* Linha 1: nome + selo de estoque baixo */}
      <View style={styles.linhaTopo}>
        <Text style={styles.nome} numberOfLines={1}>
          {produto.nome}
        </Text>

        {estoqueBaixo ? (
          <View style={styles.badge}>
            <Text style={styles.badgeTexto}>ESTOQUE BAIXO</Text>
          </View>
        ) : null}
      </View>

      {/* Categoria do produto */}
      {categoriaNome ? (
        <Text style={styles.categoria}>{categoriaNome}</Text>
      ) : null}

      {/* Descrição (limitada a 2 linhas) */}
      {produto.descricao ? (
        <Text style={styles.descricao} numberOfLines={2}>
          {produto.descricao}
        </Text>
      ) : null}

      {/* Linha 2: preço à esquerda, quantidade à direita */}
      <View style={styles.rodape}>
        <Text style={styles.preco}>{formatarPreco(produto.preco)}</Text>

        <View style={styles.quantidadeArea}>
          <Text
            style={[styles.quantidade, estoqueBaixo && styles.quantidadeBaixa]}
          >
            {produto.quantidade} un.
          </Text>
          <Text style={styles.minimo}>mín. {produto.estoqueMinimo}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: tema.cores.cartao,
    borderRadius: tema.raios.lg,
    padding: tema.espacamentos.md,
    marginBottom: tema.espacamentos.md,
    ...tema.sombras.cartao,
  },

  linhaTopo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  nome: {
    flex: 1,
    fontSize: tema.fontes.subtitulo,
    fontWeight: '700',
    color: tema.cores.texto,
    marginRight: tema.espacamentos.sm,
  },

  badge: {
    backgroundColor: tema.cores.alerta,
    paddingHorizontal: tema.espacamentos.sm,
    paddingVertical: 4,
    borderRadius: tema.raios.sm,
  },

  badgeTexto: {
    fontSize: tema.fontes.pequena - 1,
    fontWeight: '800',
    color: tema.cores.erro,
  },

  categoria: {
    fontSize: tema.fontes.normal,
    color: tema.cores.textoSecundario,
    marginTop: tema.espacamentos.xs,
  },

  descricao: {
    fontSize: tema.fontes.normal,
    color: tema.cores.textoSecundario,
    marginTop: tema.espacamentos.sm,
    lineHeight: 19,
  },

  rodape: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: tema.espacamentos.md,
    paddingTop: tema.espacamentos.sm,
    borderTopWidth: 1,
    borderTopColor: tema.cores.borda,
  },

  preco: {
    fontSize: tema.fontes.media,
    fontWeight: '700',
    color: tema.cores.primario,
  },

  quantidadeArea: {
    alignItems: 'flex-end',
  },

  quantidade: {
    fontSize: tema.fontes.normal,
    fontWeight: '700',
    color: tema.cores.sucesso,
  },

  quantidadeBaixa: {
    color: tema.cores.erro,
  },

  minimo: {
    fontSize: tema.fontes.pequena,
    color: tema.cores.textoSecundario,
    marginTop: 2,
  },
});
