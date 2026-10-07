import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

import { tema } from '../styles/theme';
import type { Movimentacao } from '../types';

type Props = {
  movimentacao: Movimentacao;
  nomeProduto?: string; // nome do produto (FK resolvida)
};

// Formata a data ISO no padrão brasileiro: 07/10/2026 14:30
function formatarData(iso: string): string {
  const data = new Date(iso);
  const dia = String(data.getDate()).padStart(2, '0');
  const mes = String(data.getMonth() + 1).padStart(2, '0');
  const ano = data.getFullYear();
  const hora = String(data.getHours()).padStart(2, '0');
  const minuto = String(data.getMinutes()).padStart(2, '0');
  return `${dia}/${mes}/${ano} ${hora}:${minuto}`;
}

// Item reutilizável da lista de movimentações.
// Usado no histórico geral e no detalhe do produto.
export default function ItemMovimentacao({ movimentacao, nomeProduto }: Props) {
  const ehEntrada = movimentacao.tipo === 'entrada';

  return (
    <View style={styles.item}>
      {/* Ícone: verde para entrada, vermelho para saída */}
      <View
        style={[
          styles.icone,
          { backgroundColor: ehEntrada ? tema.cores.sucessoFundo : tema.cores.erroFundo },
        ]}
      >
        <Text
          style={[
            styles.iconeTexto,
            { color: ehEntrada ? tema.cores.sucesso : tema.cores.erro },
          ]}
        >
          {ehEntrada ? '↓' : '↑'}
        </Text>
      </View>

      {/* Dados da movimentação */}
      <View style={styles.conteudo}>
        <Text style={styles.produto} numberOfLines={1}>
          {nomeProduto ?? 'Produto'}
        </Text>
        <Text style={styles.data}>{formatarData(movimentacao.data)}</Text>
      </View>

      {/* Quantidade: + para entrada, − para saída */}
      <View style={styles.valorArea}>
        <Text
          style={[
            styles.valor,
            { color: ehEntrada ? tema.cores.sucesso : tema.cores.erro },
          ]}
        >
          {ehEntrada ? '+' : '−'}
          {movimentacao.quantidade}
        </Text>
        <Text style={styles.tipo}>{ehEntrada ? 'Entrada' : 'Saída'}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: tema.cores.cartao,
    borderRadius: tema.raios.md,
    padding: tema.espacamentos.md,
    marginBottom: tema.espacamentos.sm,
    ...tema.sombras.cartao,
  },

  icone: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: tema.espacamentos.sm,
  },

  iconeTexto: {
    fontSize: 20,
    fontWeight: '800',
  },

  conteudo: {
    flex: 1,
    marginRight: tema.espacamentos.sm,
  },

  produto: {
    fontSize: tema.fontes.normal,
    fontWeight: '700',
    color: tema.cores.texto,
  },

  data: {
    fontSize: tema.fontes.pequena,
    color: tema.cores.textoSecundario,
    marginTop: 2,
  },

  valorArea: {
    alignItems: 'flex-end',
  },

  valor: {
    fontSize: tema.fontes.subtitulo,
    fontWeight: '800',
  },

  tipo: {
    fontSize: tema.fontes.pequena,
    color: tema.cores.textoSecundario,
    marginTop: 2,
  },
});
