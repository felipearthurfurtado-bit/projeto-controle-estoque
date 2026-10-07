import React from 'react';
import {
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
} from 'react-native';

import { tema } from '../styles/theme';

type Variante = 'primario' | 'secundario' | 'sucesso' | 'erro' | 'fantasma';

type Props = {
  titulo: string;
  onPress: () => void;
  variante?: Variante;
  desabilitado?: boolean;
  carregando?: boolean;
  estilo?: ViewStyle;
};

// Cores de fundo e texto de cada variante do botão.
const variantes: Record<Variante, { fundo: string; texto: string }> = {
  primario: { fundo: tema.cores.secundario, texto: tema.cores.branco },
  secundario: { fundo: tema.cores.claro, texto: tema.cores.primario },
  sucesso: { fundo: tema.cores.sucesso, texto: tema.cores.branco },
  erro: { fundo: tema.cores.erro, texto: tema.cores.branco },
  fantasma: { fundo: 'transparent', texto: tema.cores.secundario },
};

// Botão reutilizável, grande e fácil de tocar.
// Usado em várias telas (início, formulários, detalhes...).
export default function BotaoPrincipal({
  titulo,
  onPress,
  variante = 'primario',
  desabilitado = false,
  carregando = false,
  estilo,
}: Props) {
  const cores = variantes[variante];
  const ativo = !desabilitado && !carregando;

  return (
    <TouchableOpacity
      style={[
        styles.base,
        { backgroundColor: cores.fundo },
        // Sombra apenas nos botões preenchidos.
        variante !== 'fantasma' && tema.sombras.botao,
        !ativo && styles.desabilitado,
        estilo,
      ]}
      onPress={onPress}
      disabled={!ativo}
      activeOpacity={0.8}
    >
      {carregando ? (
        <ActivityIndicator color={cores.texto} style={styles.indicador} />
      ) : null}

      <Text style={[styles.texto, { color: cores.texto }]}>{titulo}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 52,
    borderRadius: tema.raios.md,
    paddingHorizontal: tema.espacamentos.lg,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },

  texto: {
    fontSize: tema.fontes.media,
    fontWeight: '700',
  },

  indicador: {
    marginRight: tema.espacamentos.sm,
  },

  desabilitado: {
    opacity: 0.5,
  },
});
