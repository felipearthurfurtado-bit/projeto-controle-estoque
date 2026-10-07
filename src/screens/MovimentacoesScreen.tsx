import React, { useState } from 'react';
import { View, Text, FlatList, StyleSheet, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import Header from '../components/Header';
import BotaoPrincipal from '../components/BotaoPrincipal';
import ItemMovimentacao from '../components/ItemMovimentacao';
import { tema } from '../styles/theme';
import type { Movimentacao } from '../types';
import { listarMovimentacoes } from '../services/movimentacoesService';
import { listarProdutos } from '../services/produtosService';

// Tela de Movimentações: histórico de entradas e saídas do estoque.
export default function MovimentacoesScreen({ navigation }: any) {
  const [movimentacoes, setMovimentacoes] = useState<Movimentacao[]>([]);
  const [nomesProdutos, setNomesProdutos] = useState<Record<string, string>>(
    {},
  );

  // Recarrega o histórico toda vez que a tela ganha foco.
  useFocusEffect(
    React.useCallback(() => {
      let ativo = true;
      (async () => {
        try {
          const [movs, produtos] = await Promise.all([
            listarMovimentacoes(),
            listarProdutos(),
          ]);
          if (!ativo) return;
          setMovimentacoes(movs);
          // Mapa id -> nome para exibir o produto em cada item.
          const mapa: Record<string, string> = {};
          produtos.forEach((item) => {
            mapa[item.id] = item.nome;
          });
          setNomesProdutos(mapa);
        } catch (erro) {
          if (ativo) Alert.alert('Erro', (erro as Error).message);
        }
      })();
      return () => {
        ativo = false;
      };
    }, []),
  );

  return (
    <View style={styles.container}>
      <Header titulo="Movimentações" subtitulo="Entradas e saídas do estoque" />

      {/* Lista do histórico (FlatList) */}
      <FlatList
        data={movimentacoes}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listaConteudo}
        ListEmptyComponent={
          <Text style={styles.vazio}>Nenhuma movimentação registrada.</Text>
        }
        renderItem={({ item }) => (
          <ItemMovimentacao
            movimentacao={item}
            nomeProduto={nomesProdutos[item.produtoId] ?? 'Produto'}
          />
        )}
      />

      {/* Botão fixo para registrar nova movimentação */}
      <View style={styles.rodape}>
        <BotaoPrincipal
          titulo="Nova movimentação"
          onPress={() => navigation.navigate('NovaMovimentacao')}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: tema.cores.fundo,
  },

  listaConteudo: {
    flexGrow: 1,
    padding: tema.espacamentos.md,
    paddingBottom: tema.espacamentos.sm,
  },

  vazio: {
    textAlign: 'center',
    color: tema.cores.textoSecundario,
    fontSize: tema.fontes.normal,
    marginTop: tema.espacamentos.xl,
  },

  rodape: {
    padding: tema.espacamentos.md,
    paddingTop: 0,
  },
});
