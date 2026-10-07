import React from 'react';
import { Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';

import { tema } from '../styles/theme';
import type { RootStackParamList, AbasParamList } from '../types';

import InicioScreen from '../screens/InicioScreen';
import ProdutosScreen from '../screens/ProdutosScreen';
import CategoriasScreen from '../screens/CategoriasScreen';
import MovimentacoesScreen from '../screens/MovimentacoesScreen';
import FormProdutoScreen from '../screens/FormProdutoScreen';
import DetalhesProdutoScreen from '../screens/DetalhesProdutoScreen';
import NovaMovimentacaoScreen from '../screens/NovaMovimentacaoScreen';

// Abas inferiores: Início, Produtos, Categorias e Movimentações.
const Abas = createBottomTabNavigator<AbasParamList>();

// Ícones das abas em emoji (não instala biblioteca extra).
function iconeAba(emoji: string) {
  return ({ color }: { color: string }) => (
    <Text style={{ fontSize: 20, color }}>{emoji}</Text>
  );
}

function AbasNavegacao() {
  return (
    <Abas.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: tema.cores.primario,
        tabBarInactiveTintColor: tema.cores.textoSecundario,
        tabBarStyle: {
          backgroundColor: tema.cores.cartao,
          borderTopColor: tema.cores.borda,
        },
        tabBarLabelStyle: { fontSize: 12, fontWeight: '600' },
      }}
    >
      <Abas.Screen
        name="Inicio"
        component={InicioScreen}
        options={{ title: 'Início', tabBarIcon: iconeAba('🏠') }}
      />
      <Abas.Screen
        name="Produtos"
        component={ProdutosScreen}
        options={{ tabBarIcon: iconeAba('📦') }}
      />
      <Abas.Screen
        name="Categorias"
        component={CategoriasScreen}
        options={{ tabBarIcon: iconeAba('🏷️') }}
      />
      <Abas.Screen
        name="Movimentacoes"
        component={MovimentacoesScreen}
        options={{ tabBarIcon: iconeAba('🔄') }}
      />
    </Abas.Navigator>
  );
}

// Pilha principal: abas + telas de formulário e detalhes.
const Stack = createNativeStackNavigator<RootStackParamList>();

export default function Routes() {
  return (
    // Envolve toda a navegação do aplicativo.
    <NavigationContainer>
      {/* Barra de status branca sobre o header azul. */}
      <StatusBar style="light" />

      <Stack.Navigator
        screenOptions={{
          // O header padrão fica desligado: usamos o componente Header.
          headerShown: false,
        }}
      >
        <Stack.Screen
          name="Abas"
          component={AbasNavegacao}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="FormProduto"
          component={FormProdutoScreen}
          options={{ title: 'Produto' }}
        />
        <Stack.Screen
          name="DetalhesProduto"
          component={DetalhesProdutoScreen}
          options={{ title: 'Detalhes do Produto' }}
        />
        <Stack.Screen
          name="NovaMovimentacao"
          component={NovaMovimentacaoScreen}
          options={{ title: 'Nova Movimentação' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
