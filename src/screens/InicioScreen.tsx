import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import Header from '../components/Header';
import BotaoPrincipal from '../components/BotaoPrincipal';
import CardProduto from '../components/CardProduto';
import { tema } from '../styles/theme';
import type { Categoria, Produto } from '../types';
import { listarProdutos } from '../services/produtosService';
import { listarCategorias } from '../services/categoriasService';

// Tela Início (dashboard): totais, alertas de estoque baixo e atalhos.
export default function InicioScreen({ navigation }: any) {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);

  // Recarrega os dados toda vez que a tela ganha foco.
  useFocusEffect(
    React.useCallback(() => {
      let ativo = true;
      (async () => {
        try {
          const [listaProdutos, listaCategorias] = await Promise.all([
            listarProdutos(),
            listarCategorias(),
          ]);
          if (!ativo) return;
          setProdutos(listaProdutos);
          setCategorias(listaCategorias);
        } catch (erro) {
          if (ativo) Alert.alert('Erro', (erro as Error).message);
        }
      })();
      return () => {
        ativo = false;
      };
    }, []),
  );

  // Produtos com quantidade menor ou igual ao estoque mínimo.
  const estoqueBaixo = produtos.filter(
    (produto) => produto.quantidade <= produto.estoqueMinimo,
  );

  // Nome da categoria a partir do id (FK do produto).
  function nomeCategoria(id: string): string {
    return (
      categorias.find((categoria) => categoria.id === id)?.nome ??
      'Sem categoria'
    );
  }

  return (
    <View style={styles.container}>
      <Header titulo="Início" subtitulo="Controle de Estoque" />

      <ScrollView
        style={styles.rolagem}
        contentContainerStyle={styles.rolagemConteudo}
      >
        <Text style={styles.boasVindas}>
          Bem-vindo! Aqui está o resumo do seu estoque.
        </Text>

        {/* Métricas: totais gerais */}
        <View style={styles.metricas}>
          <View style={styles.metrica}>
            <Text style={styles.metricaValor}>{produtos.length}</Text>
            <Text style={styles.metricaRotulo}>Produtos</Text>
          </View>

          <View style={styles.metrica}>
            <Text style={styles.metricaValor}>{categorias.length}</Text>
            <Text style={styles.metricaRotulo}>Categorias</Text>
          </View>

          <View style={styles.metrica}>
            <Text
              style={[
                styles.metricaValor,
                estoqueBaixo.length > 0 && styles.metricaValorAlerta,
              ]}
            >
              {estoqueBaixo.length}
            </Text>
            <Text style={styles.metricaRotulo}>Estoque baixo</Text>
          </View>
        </View>

        {/* Alertas de estoque baixo */}
        <Text style={styles.secao}>Produtos com estoque baixo</Text>
        {estoqueBaixo.length === 0 ? (
          <View style={styles.cartaoVazio}>
            <Text style={styles.vazioTexto}>
              Nenhum produto com estoque baixo. Tudo em ordem!
            </Text>
          </View>
        ) : (
          estoqueBaixo.map((produto) => (
            <CardProduto
              key={produto.id}
              produto={produto}
              categoriaNome={nomeCategoria(produto.categoriaId)}
              onPress={() =>
                navigation.navigate('DetalhesProduto', {
                  produtoId: produto.id,
                })
              }
            />
          ))
        )}

        {/* Atalhos */}
        <Text style={styles.secao}>Atalhos</Text>
        <BotaoPrincipal
          titulo="Cadastrar produto"
          onPress={() => navigation.navigate('FormProduto')}
          estilo={styles.botao}
        />
        <BotaoPrincipal
          titulo="Ver produtos"
          variante="secundario"
          onPress={() => navigation.navigate('Produtos')}
          estilo={styles.botao}
        />
        <BotaoPrincipal
          titulo="Categorias"
          variante="secundario"
          onPress={() => navigation.navigate('Categorias')}
          estilo={styles.botao}
        />
        <BotaoPrincipal
          titulo="Nova movimentação"
          variante="secundario"
          onPress={() => navigation.navigate('NovaMovimentacao')}
          estilo={styles.botao}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: tema.cores.fundo,
  },

  rolagem: {
    flex: 1,
  },

  rolagemConteudo: {
    padding: tema.espacamentos.md,
    paddingBottom: tema.espacamentos.xl,
  },

  boasVindas: {
    fontSize: tema.fontes.normal,
    color: tema.cores.textoSecundario,
    marginBottom: tema.espacamentos.md,
  },

  metricas: {
    flexDirection: 'row',
    gap: tema.espacamentos.sm,
    marginBottom: tema.espacamentos.lg,
  },

  metrica: {
    flex: 1,
    backgroundColor: tema.cores.cartao,
    borderRadius: tema.raios.lg,
    padding: tema.espacamentos.md,
    alignItems: 'center',
    ...tema.sombras.cartao,
  },

  metricaValor: {
    fontSize: tema.fontes.grande,
    fontWeight: '800',
    color: tema.cores.primario,
  },

  metricaValorAlerta: {
    color: tema.cores.erro,
  },

  metricaRotulo: {
    fontSize: tema.fontes.pequena,
    color: tema.cores.textoSecundario,
    marginTop: tema.espacamentos.xs,
    textAlign: 'center',
  },

  secao: {
    fontSize: tema.fontes.subtitulo,
    fontWeight: '700',
    color: tema.cores.texto,
    marginBottom: tema.espacamentos.sm,
    marginTop: tema.espacamentos.xs,
  },

  cartaoVazio: {
    backgroundColor: tema.cores.cartao,
    borderRadius: tema.raios.lg,
    padding: tema.espacamentos.lg,
    alignItems: 'center',
    ...tema.sombras.cartao,
  },

  vazioTexto: {
    fontSize: tema.fontes.normal,
    color: tema.cores.textoSecundario,
    textAlign: 'center',
  },

  botao: {
    marginTop: tema.espacamentos.sm,
  },
});
