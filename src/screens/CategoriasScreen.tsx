import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import Header from '../components/Header';
import BotaoPrincipal from '../components/BotaoPrincipal';
import CampoFormulario from '../components/CampoFormulario';
import { tema } from '../styles/theme';
import type { Categoria } from '../types';
import {
  excluirCategoria,
  listarCategorias,
  salvarCategoria,
} from '../services/categoriasService';
import { validarNomeCategoria } from '../services/validacaoService';

// Tela de Categorias: listar, cadastrar e excluir.
export default function CategoriasScreen() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [nome, setNome] = useState('');
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  // Carrega a lista toda vez que a tela ganha foco.
  useFocusEffect(
    React.useCallback(() => {
      let ativo = true;
      listarCategorias()
        .then((lista) => {
          if (ativo) setCategorias(lista);
        })
        .catch((e: Error) => Alert.alert('Erro', e.message));
      return () => {
        ativo = false;
      };
    }, []),
  );

  // Valida e cadastra a nova categoria.
  async function adicionar() {
    const erroValidacao = validarNomeCategoria(nome);
    if (erroValidacao) {
      setErro(erroValidacao);
      return;
    }
    setErro(null);

    setEnviando(true);
    try {
      await salvarCategoria(nome);
      setNome('');
      Alert.alert('Sucesso', 'Categoria cadastrada com sucesso.');
      setCategorias(await listarCategorias());
    } catch (e) {
      // Ex.: nome duplicado vindo do service.
      Alert.alert('Erro', (e as Error).message);
    } finally {
      setEnviando(false);
    }
  }

  // Confirma a exclusão no celular antes de apagar.
  function confirmarExclusao(categoria: Categoria) {
    Alert.alert(
      'Excluir categoria',
      `Deseja realmente excluir "${categoria.nome}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await excluirCategoria(categoria.id);
              Alert.alert('Sucesso', 'Categoria excluída com sucesso.');
              setCategorias(await listarCategorias());
            } catch (e) {
              // Ex.: categoria com produtos não pode ser excluída.
              Alert.alert('Erro', (e as Error).message);
            }
          },
        },
      ],
    );
  }

  return (
    <View style={styles.container}>
      <Header titulo="Categorias" subtitulo="Organize seus produtos" />

      {/* Cartão de cadastro */}
      <View style={styles.cartao}>
        <CampoFormulario
          label="Nova categoria"
          obrigatorio
          placeholder="Ex.: Informática"
          value={nome}
          error={erro ?? undefined}
          onChangeText={(texto) => {
            setNome(texto);
            setErro(null);
          }}
        />
        <BotaoPrincipal
          titulo="Adicionar"
          onPress={adicionar}
          carregando={enviando}
        />
      </View>

      {/* Lista de categorias */}
      <FlatList
        style={styles.lista}
        data={categorias}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listaConteudo}
        ListEmptyComponent={
          <Text style={styles.vazio}>Nenhuma categoria cadastrada.</Text>
        }
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text style={styles.itemNome}>{item.nome}</Text>
            <TouchableOpacity
              style={styles.botaoExcluir}
              onPress={() => confirmarExclusao(item)}
            >
              <Text style={styles.botaoExcluirTexto}>Excluir</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: tema.cores.fundo,
  },

  cartao: {
    backgroundColor: tema.cores.cartao,
    margin: tema.espacamentos.md,
    marginBottom: 0,
    padding: tema.espacamentos.md,
    borderRadius: tema.raios.lg,
    ...tema.sombras.cartao,
  },

  lista: {
    flex: 1,
  },

  listaConteudo: {
    padding: tema.espacamentos.md,
    paddingBottom: tema.espacamentos.xl,
    flexGrow: 1,
  },

  vazio: {
    textAlign: 'center',
    color: tema.cores.textoSecundario,
    fontSize: tema.fontes.normal,
    marginTop: tema.espacamentos.lg,
  },

  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: tema.cores.cartao,
    borderRadius: tema.raios.md,
    padding: tema.espacamentos.md,
    marginBottom: tema.espacamentos.sm,
    ...tema.sombras.cartao,
  },

  itemNome: {
    flex: 1,
    fontSize: tema.fontes.media,
    fontWeight: '600',
    color: tema.cores.texto,
    marginRight: tema.espacamentos.sm,
  },

  botaoExcluir: {
    backgroundColor: tema.cores.erroFundo,
    paddingHorizontal: tema.espacamentos.md,
    paddingVertical: tema.espacamentos.sm,
    borderRadius: tema.raios.sm,
  },

  botaoExcluirTexto: {
    color: tema.cores.erro,
    fontSize: tema.fontes.normal,
    fontWeight: '700',
  },
});
