// Tema único do aplicativo.
// Centraliza cores, espaçamentos, fontes, raios e sombras
// para manter o visual consistente em todas as telas.

// Paleta de tons de azul definida para o projeto.
export const cores = {
  primario: '#1E40AF',
  secundario: '#2563EB',
  destaque: '#3B82F6',
  claro: '#DBEAFE',

  fundo: '#F1F5F9',
  cartao: '#FFFFFF',

  texto: '#0F172A',
  textoSecundario: '#64748B',

  erro: '#DC2626',
  erroFundo: '#FEE2E2',
  sucesso: '#16A34A',
  sucessoFundo: '#DCFCE7',
  alerta: '#F59E9B',

  borda: '#E2E8F0',
  branco: '#FFFFFF',
};

// Espaçamentos (multiplos de 4).
export const espacamentos = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

// Tamanhos de fonte.
export const fontes = {
  pequena: 12,
  normal: 14,
  media: 16,
  subtitulo: 18,
  titulo: 22,
  grande: 28,
};

// Raios de borda arredondada.
export const raios = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
};

// Sombras leves (elevation = Android).
export const sombras = {
  cartao: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  botao: {
    shadowColor: '#1E40AF',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
};

export const tema = {
  cores,
  espacamentos,
  fontes,
  raios,
  sombras,
};

export default tema;
