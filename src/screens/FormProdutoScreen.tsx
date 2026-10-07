import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
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
import { listarCategorias } from '../services/categoriasService';
import {
  buscarProduto,
  salvarProduto,
  validarFormularioProduto,
} from '../services/produtosService';
import type {
  ErrosProduto,
  ProdutoFormulario,
} from '../services/validacaoService';

// Estado inicial do formulário (tudo vazio).
const FORMULARIO_VAZIO: ProdutoFormulario = {
  nome: '',
  descricao: '',
  preco: '',
  quantidade: '',
  estoqueMinimo: '',
  categoriaId: '',
};

// Tela de Cadastro e Edição de Produto, com validação completa.
export default function FormProdutoScreen({ route, navigation }: any) {
  const produtoId: string | undefined = route.params?.produtoId;
  const modoEdicao = Boolean(produtoId);

  const [form, setForm] = useState<ProdutoFormulario>(FORMULARIO_VAZIO);
  const [erros, setErros] = useState<ErrosProduto>({});
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [enviando, setEnviando] = useState(false);

  // Recarrega as categorias toda vez que a tela ganha foco.
  useFocusEffect(
    React.useCallback(() => {
      let ativo = true;
      listarCategorias()
        .then((lista) => {
          if (ativo) setCategorias(lista);
        })
        .catch((erro: Error) => Alert.alert('Erro', erro.message));
      return () => {
        ativo = false;
      };
    }, []),
  );

  // No modo edição, preenche o formulário com os dados do produto.
  useEffect(() => {
    if (!produtoId) return;
    buscarProduto(produtoId)
      .then((produto) => {
        if (!produto) {
          Alert.alert('Erro', 'Produto não encontrado.');
          return;
        }
        setForm({
          nome: produto.nome,
          descricao: produto.descricao,
          preco: String(produto.preco).replace('.', ','),
          quantidade: String(produto.quantidade),
          estoqueMinimo: String(produto.estoqueMinimo),
          categoriaId: produto.categoriaId,
        });
      })
      .catch((erro: Error) => Alert.alert('Erro', erro.message));
  }, [produtoId]);

  // Atualiza um campo e limpa o erro dele enquanto o usuário digita.
  function alterarCampo(campo: keyof ProdutoFormulario, valor: string) {
    setForm((atual) => ({ ...atual, [campo]: valor }));
    setErros((atual) => ({ ...atual, [campo]: undefined }));
  }

  // Envia o formulário: valida, bloqueia se inválido, salva e volta.
  async function enviar() {
    const errosEncontrados = validarFormularioProduto(form);
    setErros(errosEncontrados);

    // Bloqueio do cadastro quando o formulário está inválido.
    if (Object.keys(errosEncontrados).length > 0) {
      return;
    }

    setEnviando(true);
    try {
      await salvarProduto(form, produtoId);
      // Retorno de sucesso ao usuário.
      Alert.alert(
        'Sucesso',
        modoEdicao
          ? 'Produto atualizado com sucesso!'
          : 'Produto cadastrado com sucesso!',
        [{ text: 'OK', onPress: () => navigation.goBack() }],
      );
    } catch (erro) {
      Alert.alert('Erro', (erro as Error).message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <View style={styles.container}>
      <Header
        titulo={modoEdicao ? 'Editar Produto' : 'Cadastrar Produto'}
        voltar
      />

      <ScrollView
        style={styles.rolagem}
        contentContainerStyle={styles.rolagemConteudo}
        keyboardShouldPersistTaps="handled"
      >
        {/* Nome */}
        <CampoFormulario
          label="Nome do produto"
          obrigatorio
          placeholder="Ex.: Notebook Dell"
          value={form.nome}
          error={erros.nome}
          onChangeText={(texto) => alterarCampo('nome', texto)}
        />

        {/* Categoria: seleção por chips (FK do produto) */}
        <Text style={styles.label}>
          Categoria <Text style={styles.asterisco}>*</Text>
        </Text>
        <View style={styles.chips}>
          {categorias.map((categoria) => (
            <TouchableOpacity
              key={categoria.id}
              style={[
                styles.chip,
                form.categoriaId === categoria.id && styles.chipAtivo,
              ]}
              onPress={() => alterarCampo('categoriaId', categoria.id)}
            >
              <Text
                style={[
                  styles.chipTexto,
                  form.categoriaId === categoria.id && styles.chipTextoAtivo,
                ]}
              >
                {categoria.nome}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        {categorias.length === 0 ? (
          <Text style={styles.aviso}>
            Nenhuma categoria: cadastre uma na aba Categorias antes de salvar.
          </Text>
        ) : null}
        {erros.categoriaId ? (
          <Text style={styles.erro}>{erros.categoriaId}</Text>
        ) : null}

        <View style={styles.espacador} />

        {/* Preço */}
        <CampoFormulario
          label="Preço (R$)"
          obrigatorio
          placeholder="Ex.: 19,90"
          keyboardType="numeric"
          value={form.preco}
          error={erros.preco}
          onChangeText={(texto) => alterarCampo('preco', texto)}
        />

        {/* Quantidade */}
        <CampoFormulario
          label="Quantidade"
          obrigatorio
          placeholder="Ex.: 10"
          keyboardType="numeric"
          value={form.quantidade}
          error={erros.quantidade}
          onChangeText={(texto) => alterarCampo('quantidade', texto)}
        />

        {/* Estoque mínimo */}
        <CampoFormulario
          label="Estoque mínimo"
          obrigatorio
          placeholder="Ex.: 3"
          keyboardType="numeric"
          value={form.estoqueMinimo}
          error={erros.estoqueMinimo}
          onChangeText={(texto) => alterarCampo('estoqueMinimo', texto)}
        />

        {/* Descrição (opcional) */}
        <CampoFormulario
          label="Descrição"
          placeholder="Detalhes do produto"
          multiline
          value={form.descricao}
          onChangeText={(texto) => alterarCampo('descricao', texto)}
        />

        {/* Botões */}
        <BotaoPrincipal
          titulo={modoEdicao ? 'Salvar' : 'Cadastrar'}
          onPress={enviar}
          carregando={enviando}
          estilo={styles.botao}
        />
        <BotaoPrincipal
          titulo="Cancelar"
          variante="secundario"
          onPress={() => navigation.goBack()}
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

  label: {
    fontSize: tema.fontes.normal,
    fontWeight: '600',
    color: tema.cores.texto,
    marginBottom: tema.espacamentos.xs + 2,
  },

  asterisco: {
    color: tema.cores.erro,
  },

  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: tema.espacamentos.sm,
  },

  chip: {
    paddingHorizontal: tema.espacamentos.md,
    paddingVertical: tema.espacamentos.sm,
    borderRadius: tema.raios.xl,
    backgroundColor: tema.cores.cartao,
    borderWidth: 1,
    borderColor: tema.cores.borda,
  },

  chipAtivo: {
    backgroundColor: tema.cores.primario,
    borderColor: tema.cores.primario,
  },

  chipTexto: {
    fontSize: tema.fontes.normal,
    color: tema.cores.texto,
  },

  chipTextoAtivo: {
    color: tema.cores.branco,
    fontWeight: '700',
  },

  aviso: {
    fontSize: tema.fontes.pequena,
    color: tema.cores.textoSecundario,
    marginTop: tema.espacamentos.sm,
    fontStyle: 'italic',
  },

  erro: {
    fontSize: tema.fontes.pequena,
    color: tema.cores.erro,
    fontWeight: '600',
    marginTop: tema.espacamentos.xs + 1,
  },

  espacador: {
    height: tema.espacamentos.xs,
  },

  botao: {
    marginTop: tema.espacamentos.sm,
  },
});
