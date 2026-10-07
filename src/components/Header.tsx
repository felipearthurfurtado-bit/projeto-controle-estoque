import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { tema } from '../styles/theme';

type Props = {
  titulo: string;
  subtitulo?: string;
  voltar?: boolean; // mostra o botão de voltar (telas da pilha)
};

// Cabeçalho reutilizável de todas as telas.
// Respeita a área da status bar (safe area) e fica em azul primário.
export default function Header({ titulo, subtitulo, voltar = false }: Props) {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top + tema.espacamentos.sm },
      ]}
    >
      {/* Botão de voltar: aparece só nas telas de formulário/detalhes. */}
      {voltar ? (
        <TouchableOpacity
          style={styles.botaoVoltar}
          onPress={() => navigation.goBack()}
          accessibilityLabel="Voltar"
        >
          <Text style={styles.seta}>←</Text>
        </TouchableOpacity>
      ) : null}

      <View style={styles.textos}>
        <Text style={styles.titulo}>{titulo}</Text>
        {subtitulo ? <Text style={styles.subtitulo}>{subtitulo}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: tema.cores.primario,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: tema.espacamentos.md,
    paddingBottom: tema.espacamentos.md,
    borderBottomLeftRadius: tema.raios.lg,
    borderBottomRightRadius: tema.raios.lg,
  },

  botaoVoltar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.20)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: tema.espacamentos.sm,
  },

  seta: {
    color: tema.cores.branco,
    fontSize: 20,
    fontWeight: '700',
  },

  textos: {
    flex: 1,
  },

  titulo: {
    color: tema.cores.branco,
    fontSize: tema.fontes.subtitulo,
    fontWeight: '700',
  },

  subtitulo: {
    color: tema.cores.claro,
    fontSize: tema.fontes.normal,
    marginTop: 2,
  },
});
