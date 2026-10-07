import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import Header from '../components/Header';
import BotaoPrincipal from '../components/BotaoPrincipal';
import ItemMovimentacao from '../components/ItemMovimentacao';
import { tema } from '../styles/theme';
import type { Movimentacao, Produto } from '../types';
import { buscarProduto, excluirProduto } from '../services/produtosService';
import { listarCategorias } from '../services/categoriasService';
import { listarMovimentacoesDoProduto } from '../services/movimentacoesService';

// Tela de Detalhes: mostra os dados e permite editar, excluir e movimentar.
export default function DetalhesProdutoScreen({ route, navigation }: any) {
  const produtoId: string = route.params.produtoId;

  const [produto, setProduto] = useState<Produto | null>(null);
  const [categoriaNome, setCategoriaNome] = useState('Sem categoria');
  const [movimentacoes, setMovimentacoes] = useState<Movimentacao[]>([]);
  const [carregado, setCarregado] = useState(false);

  // Recarrega os dados toda vez que a tela ganha foco (ex.: volta da edição).
  useFocusEffect(
    React.useCallback(() => {
      let ativo = true;
      (async () => {
        try {
          const [item, categorias, movs] = await Promise.all([
            buscarProduto(produtoId),
            listarCategorias(),
            listarMovimentacoesDoProduto(produtoId),
          ]);
          if (!ativo) return;
          setCarregado(true);
          if (item) setProduto(item);
          setCategoriaNome(
            categorias.find((c) => c.id === item?.categoriaId)?.nome ??
              'Sem categoria',
          );
          setMovimentacoes(movs);
        } catch (erro) {
          if (ativo) Alert.alert('Erro', (erro as Error).message);
        }
      })();
      return () => {
        ativo = false;
      };
    }, [produtoId]),
  );

  // Confirma no celular antes de excluir o produto.
  function confirmarExclusao() {
    Alert.alert(
      'Excluir produto',
      `Deseja realmente excluir "${produto?.nome}"? As movimentações também serão apagadas.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await excluirProduto(produtoId);
              Alert.alert('Sucesso', 'Produto excluído com sucesso.');
              navigation.goBack();
            } catch (erro) {
              Alert.alert('Erro', (erro as Error).message);
            }
          },
        },
      ],
    );
  }

  // Enquanto carrega os dados.
  if (!carregado) {
    return (
      <View style={styles.container}>
        <Header titulo="Detalhes do Produto" voltar />
        <Text style={styles.avisoCentral}>Carregando...</Text>
      </View>
    );
  }

  // Produto inexistente ou já excluído.
  if (!produto) {
    return (
      <View style={styles.container}>
        <Header titulo="Detalhes do Produto" voltar />
        <Text style={styles.avisoCentral}>Produto não encontrado.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header titulo="Detalhes do Produto" voltar />

      <ScrollView
        style={styles.rolagem}
        contentContainerStyle={styles.rolagemConteudo}
      >
        {/* Cartão com os dados completos do produto */}
        <View style={styles.cartao}>
          <View style={styles.linhaTitulo}>
            <Text style={styles.nome}>{produto.nome}</Text>

            {/* Selo de situação do estoque */}
            <View
              style={[
                styles.badge,
                {
                  backgroundColor:
                    produto.quantidade <= produto.estoqueMinimo
                      ? tema.cores.alerta
                      : tema.cores.sucessoFundo,
                },
              ]}
            >
              <Text
                style={[
                  styles.badgeTexto,
                  {
                    color:
                      produto.quantidade <= produto.estoqueMinimo
                        ? tema.cores.erro
                        : tema.cores.sucesso,
                  },
                ]}
              >
                {produto.quantidade <= produto.estoqueMinimo
                  ? 'ESTOQUE BAIXO'
                  : 'ESTOQUE OK'}
              </Text>
            </View>
          </View>

          {/* Linhas de dados (rótulo e valor) */}
          {[
            { rotulo: 'Categoria', valor: categoriaNome },
            { rotulo: 'Descrição', valor: produto.descricao || '—' },
            {
              rotulo: 'Preço',
              valor: `R$ ${produto.preco.toFixed(2).replace('.', ',')}`,
            },
            { rotulo: 'Quantidade', valor: `${produto.quantidade} un.` },
            { rotulo: 'Estoque mínimo', valor: `${produto.estoqueMinimo} un.` },
          ].map((dado) => (
            <View key={dado.rotulo} style={styles.linha}>
              <Text style={styles.linhaRotulo}>{dado.rotulo}</Text>
              <Text style={styles.linhaValor}>{dado.valor}</Text>
            </View>
          ))}
        </View>

        {/* Ações do produto */}
        <BotaoPrincipal
          titulo="Editar produto"
          onPress={() => navigation.navigate('FormProduto', { produtoId })}
          estilo={styles.botao}
        />
        <BotaoPrincipal
          titulo="Registrar movimentação"
          variante="secundario"
          onPress={() => navigation.navigate('NovaMovimentacao', { produtoId })}
          estilo={styles.botao}
        />
        <BotaoPrincipal
          titulo="Excluir produto"
          variante="erro"
          onPress={confirmarExclusao}
          estilo={styles.botao}
        />

        {/* Histórico de movimentações do produto */}
        <Text style={styles.secao}>Movimentações</Text>
        {movimentacoes.length === 0 ? (
          <Text style={styles.vazio}>
            Nenhuma movimentação para este produto.
          </Text>
        ) : (
          movimentacoes.map((movimentacao) => (
            <ItemMovimentacao
              key={movimentacao.id}
              movimentacao={movimentacao}
              nomeProduto={produto.nome}
            />
          ))
        )}
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

  avisoCentral: {
    textAlign: 'center',
    color: tema.cores.textoSecundario,
    fontSize: tema.fontes.media,
    marginTop: tema.espacamentos.xl,
    paddingHorizontal: tema.espacamentos.lg,
  },

  cartao: {
    backgroundColor: tema.cores.cartao,
    borderRadius: tema.raios.lg,
    padding: tema.espacamentos.md,
    marginBottom: tema.espacamentos.md,
    ...tema.sombras.cartao,
  },

  linhaTitulo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: tema.espacamentos.sm,
  },

  nome: {
    flex: 1,
    fontSize: tema.fontes.titulo,
    fontWeight: '700',
    color: tema.cores.texto,
    marginRight: tema.espacamentos.sm,
  },

  badge: {
    paddingHorizontal: tema.espacamentos.sm,
    paddingVertical: 4,
    borderRadius: tema.raios.sm,
  },

  badgeTexto: {
    fontSize: tema.fontes.pequena,
    fontWeight: '800',
  },

  linha: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: tema.espacamentos.sm,
    borderTopWidth: 1,
    borderTopColor: tema.cores.borda,
  },

  linhaRotulo: {
    fontSize: tema.fontes.normal,
    color: tema.cores.textoSecundario,
  },

  linhaValor: {
    fontSize: tema.fontes.normal,
    color: tema.cores.texto,
    fontWeight: '600',
    flexShrink: 1,
    textAlign: 'right',
    marginLeft: tema.espacamentos.sm,
  },

  botao: {
    marginTop: tema.espacamentos.sm,
  },

  secao: {
    fontSize: tema.fontes.subtitulo,
    fontWeight: '700',
    color: tema.cores.texto,
    marginTop: tema.espacamentos.lg,
    marginBottom: tema.espacamentos.sm,
  },

  vazio: {
    fontSize: tema.fontes.normal,
    color: tema.cores.textoSecundario,
    fontStyle: 'italic',
    marginBottom: tema.espacamentos.sm,
  },
});
