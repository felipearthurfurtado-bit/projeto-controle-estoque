import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import Header from '../components/Header';
import BotaoPrincipal from '../components/BotaoPrincipal';
import CardProduto from '../components/CardProduto';
import { tema } from '../styles/theme';
import type { Categoria, Produto } from '../types';
import { listarProdutos } from '../services/produtosService';
import { listarCategorias } from '../services/categoriasService';

// Tela Lista de Produtos: FlatList com busca por nome e filtro por categoria.
export default function ProdutosScreen({ navigation }: any) {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [busca, setBusca] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState('todas');

  // Recarrega os dados toda vez que a tela ganha foco (ex.: volta da edição).
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

  // Nome da categoria a partir do id (FK do produto).
  function nomeCategoria(id: string): string {
    return (
      categorias.find((categoria) => categoria.id === id)?.nome ??
      'Sem categoria'
    );
  }

  // Aplica a busca por nome e o filtro por categoria.
  const produtosFiltrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    return produtos.filter((produto) => {
      const confereNome = produto.nome.toLowerCase().includes(termo);
      const confereCategoria =
        filtroCategoria === 'todas' ||
        produto.categoriaId === filtroCategoria;
      return confereNome && confereCategoria;
    });
  }, [produtos, busca, filtroCategoria]);

  return (
    <View style={styles.container}>
      <Header titulo="Produtos" subtitulo="Catálogo do estoque" />

      {/* Busca por nome */}
      <View style={styles.buscaArea}>
        <View style={styles.busca}>
          <Text style={styles.buscaIcone}>🔍</Text>
          <TextInput
            style={styles.buscaInput}
            placeholder="Buscar produto pelo nome..."
            placeholderTextColor={tema.cores.textoSecundario}
            value={busca}
            onChangeText={setBusca}
          />
        </View>

        {/* Filtro por categoria (chips roláveis) */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtros}
        >
          <TouchableOpacity
            style={[
              styles.filtro,
              filtroCategoria === 'todas' && styles.filtroAtivo,
            ]}
            onPress={() => setFiltroCategoria('todas')}
          >
            <Text
              style={[
                styles.filtroTexto,
                filtroCategoria === 'todas' && styles.filtroTextoAtivo,
              ]}
            >
              Todas
            </Text>
          </TouchableOpacity>

          {categorias.map((categoria) => (
            <TouchableOpacity
              key={categoria.id}
              style={[
                styles.filtro,
                filtroCategoria === categoria.id && styles.filtroAtivo,
              ]}
              onPress={() => setFiltroCategoria(categoria.id)}
            >
              <Text
                style={[
                  styles.filtroTexto,
                  filtroCategoria === categoria.id && styles.filtroTextoAtivo,
                ]}
              >
                {categoria.nome}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Lista de produtos (FlatList) */}
      <FlatList
        data={produtosFiltrados}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listaConteudo}
        ListEmptyComponent={
          <Text style={styles.vazio}>
            {produtos.length === 0
              ? 'Nenhum produto cadastrado ainda. Cadastre o primeiro!'
              : 'Nenhum produto encontrado para a busca.'}
          </Text>
        }
        renderItem={({ item }) => (
          <CardProduto
            produto={item}
            categoriaNome={nomeCategoria(item.categoriaId)}
            onPress={() =>
              navigation.navigate('DetalhesProduto', { produtoId: item.id })
            }
          />
        )}
      />

      {/* Botão fixo de cadastro */}
      <View style={styles.rodape}>
        <BotaoPrincipal
          titulo="Cadastrar produto"
          onPress={() => navigation.navigate('FormProduto')}
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

  buscaArea: {
    backgroundColor: tema.cores.cartao,
    paddingHorizontal: tema.espacamentos.md,
    paddingTop: tema.espacamentos.md,
    paddingBottom: tema.espacamentos.sm,
    borderBottomLeftRadius: tema.raios.lg,
    borderBottomRightRadius: tema.raios.lg,
    ...tema.sombras.cartao,
  },

  busca: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: tema.cores.fundo,
    borderRadius: tema.raios.md,
    paddingHorizontal: tema.espacamentos.md,
    height: 48,
    borderWidth: 1,
    borderColor: tema.cores.borda,
  },

  buscaIcone: {
    marginRight: tema.espacamentos.sm,
    fontSize: tema.fontes.media,
  },

  buscaInput: {
    flex: 1,
    height: '100%',
    fontSize: tema.fontes.media,
    color: tema.cores.texto,
  },

  filtros: {
    gap: tema.espacamentos.sm,
    paddingTop: tema.espacamentos.sm,
    paddingRight: tema.espacamentos.md,
  },

  filtro: {
    paddingHorizontal: tema.espacamentos.md,
    paddingVertical: tema.espacamentos.sm - 2,
    borderRadius: tema.raios.xl,
    backgroundColor: tema.cores.fundo,
    borderWidth: 1,
    borderColor: tema.cores.borda,
  },

  filtroAtivo: {
    backgroundColor: tema.cores.primario,
    borderColor: tema.cores.primario,
  },

  filtroTexto: {
    fontSize: tema.fontes.normal,
    color: tema.cores.texto,
  },

  filtroTextoAtivo: {
    color: tema.cores.branco,
    fontWeight: '700',
  },

  listaConteudo: {
    padding: tema.espacamentos.md,
    paddingBottom: tema.espacamentos.sm,
    flexGrow: 1,
  },

  vazio: {
    textAlign: 'center',
    color: tema.cores.textoSecundario,
    fontSize: tema.fontes.normal,
    marginTop: tema.espacamentos.xl,
    paddingHorizontal: tema.espacamentos.lg,
    lineHeight: 20,
  },

  rodape: {
    padding: tema.espacamentos.md,
    paddingTop: 0,
  },
});
