import React from 'react';
import { View, Text, TextInput, StyleSheet, TextInputProps } from 'react-native';

import { tema } from '../styles/theme';

type Props = TextInputProps & {
  label: string;
  error?: string; // mensagem de erro exibida abaixo do campo
  obrigatorio?: boolean;
};

// Campo de formulário reutilizável com label, asterisco de obrigatório
// e mensagem de erro. Usado nos formulários do app (produto, movimentação...).
export default function CampoFormulario({
  label,
  error,
  obrigatorio = false,
  ...rest
}: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>
        {label}
        {obrigatorio ? <Text style={styles.asterisco}> *</Text> : null}
      </Text>

      <TextInput
        {...rest}
        style={[
          styles.input,
          rest.multiline ? styles.textArea : null,
          error ? styles.inputErro : null,
        ]}
        placeholderTextColor={tema.cores.textoSecundario}
      />

      {/* Mensagem de erro clara, aparece só quando o campo é inválido. */}
      {error ? <Text style={styles.erro}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: tema.espacamentos.md,
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

  input: {
    height: 50,
    backgroundColor: tema.cores.cartao,
    borderWidth: 1,
    borderColor: tema.cores.borda,
    borderRadius: tema.raios.md,
    paddingHorizontal: tema.espacamentos.md,
    fontSize: tema.fontes.media,
    color: tema.cores.texto,
  },

  textArea: {
    height: 110,
    paddingTop: tema.espacamentos.sm,
    textAlignVertical: 'top',
  },

  inputErro: {
    borderColor: tema.cores.erro,
    backgroundColor: tema.cores.erroFundo,
  },

  erro: {
    marginTop: tema.espacamentos.xs + 1,
    fontSize: tema.fontes.pequena,
    color: tema.cores.erro,
    fontWeight: '600',
  },
});
