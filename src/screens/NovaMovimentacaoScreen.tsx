import React, { useState } from 'react';
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
import type { Produto, TipoMovimentacao } from '../types';
import { listarProdutos } from '../services/produtosService';
import { registrarMovimentacao } from '../services/movimentacoesService';
import { validarQuantidadeMovimentacao } from '../services/validacaoService';

// Tela Nova Movimentação: registra entrada/saída e atualiza o estoque.
export default function NovaMovimentacaoScreen({ route, navigation }: any) {
  // Pode abrir com um produto já selecionado (vinda do detalhe).
  const produtoIdInicial: string | undefined = route.params?.produtoId;

  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [produtoId, setProdutoId] = useState(produtoIdInicial ?? '');
  const [tipo, setTipo] = useState<TipoMovimentacao>('entrada');
  const [quantidade, setQuantidade] = useState('');
  const [erros, setErros] = useState<{
    produto?: string;
    quantidade?: string;
  }>({});
  const [enviando, setEnviando] = useState(false);

  // Carrega os produtos toda vez que a tela ganha foco.
  useFocusEffect(
    React.useCallback(() => {
      let ativo = true;
      listarProdutos()
        .then((lista) => {
          if (ativo) setProdutos(lista);
        })
        .catch((erro: Error) => Alert.alert('Erro', erro.message));
      return () => {
        ativo = false;
      };
    }, []),
  );

  const produtoSelecionado = produtos.find((item) => item.id === produtoId);

  // Valida e registra a movimentação.
  async function registrar() {
    const novosErros: { produto?: string; quantidade?: string } = {};

    if (!produtoId) {
      novosErros.produto = 'Selecione um produto.';
    }
    const erroQuantidade = validarQuantidadeMovimentacao(quantidade);
    if (erroQuantidade) {
      novosErros.quantidade = erroQuantidade;
    }

    setErros(novosErros);
    if (Object.keys(novosErros).length > 0) {
      return; // bloqueia o envio quando inválido
    }

    setEnviando(true);
    try {
      await registrarMovimentacao(produtoId, tipo, Number(quantidade));
      Alert.alert(
        'Sucesso',
        tipo === 'entrada'
          ? 'Entrada registrada com sucesso!'
          : 'Saída registrada com sucesso!',
        [{ text: 'OK', onPress: () => navigation.goBack() }],
      );
    } catch (erro) {
      // Ex.: "Saída não permitida: estoque insuficiente (disponível: X)."
      Alert.alert('Erro', (erro as Error).message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <View style={styles.container}>
      <Header titulo="Nova Movimentação" voltar />

      <ScrollView
        style={styles.rolagem}
        contentContainerStyle={styles.rolagemConteudo}
        keyboardShouldPersistTaps="handled"
      >
        {/* Seleção do produto (chips com a quantidade atual) */}
        <Text style={styles.label}>
          Produto <Text style={styles.asterisco}>*</Text>
        </Text>
        <View style={styles.chips}>
          {produtos.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.chip,
                produtoId === item.id && styles.chipAtivo,
              ]}
              onPress={() => {
                setProdutoId(item.id);
                setErros((atual) => ({ ...atual, produto: undefined }));
              }}
            >
              <Text
                style={[
                  styles.chipTexto,
                  produtoId === item.id && styles.chipTextoAtivo,
                ]}
              >
                {item.nome} ({item.quantidade} un.)
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        {produtos.length === 0 ? (
          <Text style={styles.aviso}>
            Nenhum produto: cadastre um produto antes de movimentar.
          </Text>
        ) : null}
        {erros.produto ? <Text style={styles.erro}>{erros.produto}</Text> : null}

        {/* Tipo da movimentação */}
        <Text style={styles.label}>Tipo</Text>
        <View style={styles.tipos}>
          <TouchableOpacity
            style={[styles.tipo, tipo === 'entrada' && styles.tipoEntrada]}
            onPress={() => setTipo('entrada')}
          >
            <Text
              style={[styles.tipoTexto, tipo === 'entrada' && styles.tipoTextoClaro]}
            >
              ↓ Entrada
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tipo, tipo === 'saida' && styles.tipoSaida]}
            onPress={() => setTipo('saida')}
          >
            <Text
              style={[styles.tipoTexto, tipo === 'saida' && styles.tipoTextoClaro]}
            >
              ↑ Saída
            </Text>
          </TouchableOpacity>
        </View>

        {/* Quantidade */}
        <CampoFormulario
          label="Quantidade"
          obrigatorio
          placeholder="Ex.: 5"
          keyboardType="numeric"
          value={quantidade}
          error={erros.quantidade}
          onChangeText={(texto) => {
            setQuantidade(texto);
            setErros((atual) => ({ ...atual, quantidade: undefined }));
          }}
        />

        {/* Mostra o estoque atual do produto escolhido */}
        {produtoSelecionado ? (
          <Text style={styles.aviso}>
            Estoque atual: {produtoSelecionado.quantidade} un. | Mínimo:{' '}
            {produtoSelecionado.estoqueMinimo} un.
          </Text>
        ) : null}

        <BotaoPrincipal
          titulo="Registrar"
          onPress={registrar}
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

  tipos: {
    flexDirection: 'row',
    gap: tema.espacamentos.sm,
    marginBottom: tema.espacamentos.md,
  },

  tipo: {
    flex: 1,
    height: 48,
    borderRadius: tema.raios.md,
    backgroundColor: tema.cores.cartao,
    borderWidth: 1,
    borderColor: tema.cores.borda,
    justifyContent: 'center',
    alignItems: 'center',
  },

  tipoEntrada: {
    backgroundColor: tema.cores.sucesso,
    borderColor: tema.cores.sucesso,
  },

  tipoSaida: {
    backgroundColor: tema.cores.erro,
    borderColor: tema.cores.erro,
  },

  tipoTexto: {
    fontSize: tema.fontes.media,
    fontWeight: '700',
    color: tema.cores.textoSecundario,
  },

  tipoTextoClaro: {
    color: tema.cores.branco,
  },

  aviso: {
    fontSize: tema.fontes.pequena,
    color: tema.cores.textoSecundario,
    marginBottom: tema.espacamentos.sm,
    fontStyle: 'italic',
  },

  erro: {
    fontSize: tema.fontes.pequena,
    color: tema.cores.erro,
    fontWeight: '600',
    marginTop: tema.espacamentos.xs + 1,
    marginBottom: tema.espacamentos.sm,
  },

  botao: {
    marginTop: tema.espacamentos.sm,
  },
});
