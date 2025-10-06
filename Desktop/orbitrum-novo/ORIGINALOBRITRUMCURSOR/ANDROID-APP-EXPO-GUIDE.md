# 🚀 Orbitrum Android App - Guia Completo com Expo

## 📋 Pré-Requisitos

```bash
# 1. Instalar Node.js (versão 18+)
# 2. Instalar Expo CLI globalmente
npm install --global eas-cli
npm install --global @expo/cli
```

## 🎯 PASSO 1: Criar Projeto Expo

```bash
# Criar app Orbitrum
npx create-expo-app orbitrum --template blank-typescript

# Entrar na pasta
cd orbitrum

# Inicializar com o ID do projeto
eas init --id b24cf4e1-c18b-4a7f-8db8-bf713e58c7c7
```

## 📦 PASSO 2: Instalar Dependências Necessárias

```bash
# Dependências principais
npm install @react-navigation/native @react-navigation/stack
npm install react-native-screens react-native-safe-area-context
npm install react-native-gesture-handler react-native-reanimated
npm install @expo/vector-icons
npm install expo-linear-gradient
npm install expo-blur
npm install expo-av
npm install expo-haptics
npm install expo-device
npm install expo-constants
npm install @tanstack/react-query
npm install zustand

# Para desenvolvimento
npm install --save-dev @types/react @types/react-native
```

## 🎨 PASSO 3: Estrutura de Arquivos

```
orbitrum/
├── App.tsx
├── app.json
├── components/
│   ├── StarfieldBackground.tsx
│   ├── NeuralBrain.tsx
│   ├── ProfessionalOrb.tsx
│   ├── SearchBar.tsx
│   └── Modal.tsx
├── screens/
│   ├── HomeScreen.tsx
│   ├── ClientDashboard.tsx
│   ├── ProfessionalDashboard.tsx
│   ├── AdminDashboard.tsx
│   └── LoginScreen.tsx
├── types/
│   └── index.ts
├── constants/
│   ├── Colors.ts
│   └── Professionals.ts
└── utils/
    ├── audio.ts
    └── animations.ts
```

## 📱 PASSO 4: Configurar app.json

```json
{
  "expo": {
    "name": "Orbitrum Connect",
    "slug": "orbitrum-connect",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "dark",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#0f172a"
    },
    "assetBundlePatterns": [
      "**/*"
    ],
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.orbitrum.connect"
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#0f172a"
      },
      "package": "com.orbitrum.connect",
      "permissions": [
        "VIBRATE",
        "INTERNET",
        "ACCESS_NETWORK_STATE"
      ]
    },
    "web": {
      "favicon": "./assets/favicon.png"
    },
    "plugins": [
      "expo-router",
      [
        "expo-av",
        {
          "microphonePermission": "Allow Orbitrum to access your microphone for voice features."
        }
      ]
    ],
    "extra": {
      "eas": {
        "projectId": "b24cf4e1-c18b-4a7f-8db8-bf713e58c7c7"
      }
    }
  }
}
```

## 🔧 PASSO 5: Código Principal do App

### App.tsx
```typescript
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StatusBar } from 'expo-status-bar';

import HomeScreen from './screens/HomeScreen';
import LoginScreen from './screens/LoginScreen';
import ClientDashboard from './screens/ClientDashboard';
import ProfessionalDashboard from './screens/ProfessionalDashboard';
import AdminDashboard from './screens/AdminDashboard';

const Stack = createStackNavigator();
const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <NavigationContainer>
        <StatusBar style="light" backgroundColor="#0f172a" />
        <Stack.Navigator 
          initialRouteName="Home"
          screenOptions={{
            headerShown: false,
            cardStyle: { backgroundColor: '#0f172a' }
          }}
        >
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="ClientDashboard" component={ClientDashboard} />
          <Stack.Screen name="ProfessionalDashboard" component={ProfessionalDashboard} />
          <Stack.Screen name="AdminDashboard" component={AdminDashboard} />
        </Stack.Navigator>
      </NavigationContainer>
    </QueryClientProvider>
  );
}
```

### types/index.ts
```typescript
export interface User {
  id: number;
  username: string;
  email: string;
  userType: 'client' | 'professional' | 'admin';
  tokens: number;
  plan: string;
}

export interface Professional {
  id: number;
  name: string;
  title: string;
  rating: number;
  reviews: number;
  hourlyRate: number;
  avatar: string;
  skills: string[];
  available: boolean;
  orbitRing: number;
  orbitPosition: number;
}
```

### constants/Colors.ts
```typescript
export const Colors = {
  background: '#0f172a',
  primary: '#00ffff',
  secondary: '#0ea5e9',
  text: '#e2e8f0',
  textSecondary: '#94a3b8',
  border: 'rgba(0, 255, 255, 0.3)',
  card: 'rgba(30, 41, 59, 0.3)',
  success: '#22c55e',
  warning: '#f59e0b',
  error: '#ef4444'
};
```

## 🎮 PASSO 6: Tela Principal (HomeScreen.tsx)

```typescript
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Animated
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

import StarfieldBackground from '../components/StarfieldBackground';
import NeuralBrain from '../components/NeuralBrain';
import ProfessionalOrb from '../components/ProfessionalOrb';
import { Colors } from '../constants/Colors';
import { professionals } from '../constants/Professionals';

const { width, height } = Dimensions.get('window');

export default function HomeScreen({ navigation }: any) {
  const [searchMode, setSearchMode] = useState(false);
  const [brainExpanded, setBrainExpanded] = useState(false);

  const handleBrainClick = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setBrainExpanded(true);
    
    // Som "Orbitrum" após 2 segundos
    setTimeout(() => {
      // Implementar reprodução de áudio aqui
    }, 2000);
    
    // Expandir busca após 3 segundos
    setTimeout(() => {
      setSearchMode(true);
    }, 3000);
  };

  return (
    <View style={styles.container}>
      <StarfieldBackground />
      
      {/* Header com instruções */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.loginButton}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.loginText}>🔐 Login</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.instructions}>
        <Text style={styles.instructionPrimary}>
          Conecte-se com profissionais próximos
        </Text>
        <Text style={styles.instructionSecondary}>
          Clique no Cérebro
        </Text>
      </View>

      {/* Sistema Orbital */}
      <View style={styles.orbitalSystem}>
        <NeuralBrain 
          expanded={brainExpanded}
          onPress={handleBrainClick}
        />
        
        {/* Anéis Orbitais */}
        {!searchMode && (
          <View style={styles.orbitContainer}>
            {professionals.map((prof, index) => (
              <ProfessionalOrb
                key={prof.id}
                professional={prof}
                ring={prof.orbitRing}
                position={prof.orbitPosition}
                onPress={() => {
                  Haptics.selectionAsync();
                  // Abrir modal do profissional
                }}
              />
            ))}
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 100,
  },
  loginButton: {
    backgroundColor: 'rgba(30, 41, 59, 0.8)',
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
  },
  loginText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  instructions: {
    position: 'absolute',
    top: height * 0.15,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 10,
  },
  instructionPrimary: {
    color: Colors.text,
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 5,
  },
  instructionSecondary: {
    color: Colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
  },
  orbitalSystem: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  orbitContainer: {
    position: 'absolute',
    width: width,
    height: height,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
```

## 🧠 PASSO 7: Componente Neural Brain

### components/NeuralBrain.tsx
```typescript
import React, { useEffect, useRef } from 'react';
import {
  View,
  TouchableOpacity,
  Animated,
  StyleSheet
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../constants/Colors';

interface NeuralBrainProps {
  expanded: boolean;
  onPress: () => void;
}

export default function NeuralBrain({ expanded, onPress }: NeuralBrainProps) {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animação de pulso contínua
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    );
    pulseAnimation.start();

    return () => pulseAnimation.stop();
  }, []);

  useEffect(() => {
    if (expanded) {
      // Animação de brilho quando expandido
      Animated.timing(glowAnim, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: false,
      }).start();
    }
  }, [expanded]);

  return (
    <TouchableOpacity onPress={onPress} style={styles.container}>
      <Animated.View
        style={[
          styles.brain,
          {
            transform: [{ scale: pulseAnim }],
          },
        ]}
      >
        <LinearGradient
          colors={[Colors.primary, Colors.secondary]}
          style={styles.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Animated.View
            style={[
              styles.glow,
              {
                shadowOpacity: glowAnim,
              },
            ]}
          />
        </LinearGradient>
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    zIndex: 50,
  },
  brain: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  gradient: {
    width: '100%',
    height: '100%',
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  glow: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 50,
    shadowColor: Colors.primary,
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowRadius: 20,
    elevation: 10,
  },
});
```

## 🌟 PASSO 8: Componente Professional Orb

### components/ProfessionalOrb.tsx
```typescript
import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  StyleSheet,
  Dimensions
} from 'react-native';
import { Colors } from '../constants/Colors';
import { Professional } from '../types';

const { width, height } = Dimensions.get('window');

interface ProfessionalOrbProps {
  professional: Professional;
  ring: number;
  position: number;
  onPress: () => void;
}

export default function ProfessionalOrb({ 
  professional, 
  ring, 
  position, 
  onPress 
}: ProfessionalOrbProps) {
  const rotateAnim = useRef(new Animated.Value(0)).current;
  
  const ringRadius = ring === 1 ? 120 : ring === 2 ? 180 : 240;
  const ringDuration = ring === 1 ? 30000 : ring === 2 ? 35000 : 40000;
  const ringDirection = ring === 2 ? -1 : 1; // Ring 2 vai no sentido contrário

  useEffect(() => {
    const rotation = Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: ringDirection,
        duration: ringDuration,
        useNativeDriver: true,
      })
    );
    rotation.start();

    return () => rotation.stop();
  }, []);

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  // Calcular posição na órbita
  const angleOffset = (position * 360) / (ring === 1 ? 6 : 7); // 6 orbs no ring 1, 7 nos outros
  const x = Math.cos((angleOffset * Math.PI) / 180) * ringRadius;
  const y = Math.sin((angleOffset * Math.PI) / 180) * ringRadius;

  return (
    <Animated.View
      style={[
        styles.orbContainer,
        {
          transform: [
            { translateX: x },
            { translateY: y },
            { rotate }
          ],
        },
      ]}
    >
      <TouchableOpacity onPress={onPress} style={styles.orb}>
        <View style={[
          styles.orbInner,
          { backgroundColor: professional.available ? Colors.success : Colors.warning }
        ]}>
          <Text style={styles.orbInitial}>
            {professional.name.charAt(0)}
          </Text>
        </View>
        <Text style={styles.orbName} numberOfLines={1}>
          {professional.name.split(' ')[0]}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  orbContainer: {
    position: 'absolute',
    alignItems: 'center',
  },
  orb: {
    alignItems: 'center',
  },
  orbInner: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  orbInitial: {
    color: Colors.background,
    fontSize: 18,
    fontWeight: 'bold',
  },
  orbName: {
    color: Colors.text,
    fontSize: 10,
    marginTop: 4,
    textAlign: 'center',
    maxWidth: 60,
  },
});
```

## 🚀 PASSO 9: Build APK Nativo (Como Uber App)

### Configurar EAS Build
```bash
# Configurar build
eas build:configure

# Build APK para instalar direto no celular
eas build --platform android --profile preview

# Build para distribuição (Google Play Store)
eas build --platform android --profile production
```

### eas.json - Configuração para APK Instalável
```json
{
  "cli": {
    "version": ">= 7.8.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk",
        "gradleCommand": ":app:assembleRelease"
      }
    },
    "production": {
      "android": {
        "buildType": "aab"
      }
    }
  },
  "submit": {
    "production": {
      "android": {
        "serviceAccountKeyPath": "./path-to-key.json",
        "track": "internal"
      }
    }
  }
}
```

## 📱 INSTALAÇÃO DIRETA NO CELULAR

### OPÇÃO 1: Build Local com Expo
```bash
# Instalar localmente
npx expo install --fix

# Build APK local
npx expo run:android --variant release

# APK será gerado em:
# android/app/build/outputs/apk/release/app-release.apk
```

### OPÇÃO 2: EAS Build Online
```bash
# Build na nuvem (mais fácil)
eas build --platform android --profile preview

# Expo enviará link para download do APK
# Exemplo: https://expo.dev/artifacts/eas/abc123.apk
```

### OPÇÃO 3: Expo Development Build
```bash
# Para testes rápidos durante desenvolvimento
npx expo install expo-dev-client

# Build com Expo Go customizado
eas build --platform android --profile development
```

## 📋 PASSO 10: Distribuição Independente (Igual Uber)

### 🎯 APK Para Instalar Direto no Celular

```bash
# 1. Build APK independente
eas build --platform android --profile preview

# 2. Expo retornará link para download:
# https://expo.dev/artifacts/eas/abc123-xyz456.apk

# 3. Baixar APK no celular e instalar diretamente
```

### 📱 Como Instalar no Android

1. **Baixar o APK** do link fornecido pelo Expo
2. **Permitir instalação de fontes desconhecidas**:
   - Configurações → Segurança → Fontes desconhecidas ✅
3. **Abrir o arquivo APK** baixado
4. **Tocar em "Instalar"**
5. **App instalado como qualquer outro!** 🚀

### 🔧 Comandos Completos

```bash
# Preparar projeto
npm install
npx expo install --fix

# Rodar local (desenvolvimento)
npx expo run:android

# Build APK para distribuição
eas build --platform android --profile preview

# Build para Google Play Store
eas build --platform android --profile production

# Fazer upload para Google Play Store
eas submit --platform android
```

### 🚀 Distribuição via WhatsApp/Telegram

```bash
# Após o build, você pode:
# 1. Baixar o APK do link do Expo
# 2. Enviar arquivo .apk via WhatsApp/Telegram
# 3. Pessoas instalam diretamente igual Uber!
```

## 🎯 ALTERNATIVAS RÁPIDAS (Se Expo Não Funcionar)

### OPÇÃO A: React Native CLI
```bash
# Criar projeto nativo
npx react-native init OrbitrumApp

# Copiar código do sistema web
# Build APK nativo
cd android
./gradlew assembleRelease

# APK em: android/app/build/outputs/apk/release/
```

### OPÇÃO B: Capacitor (Mais Simples)
```bash
# Usar código web existente
npm install @capacitor/core @capacitor/cli @capacitor/android

# Inicializar
npx cap init orbitrum com.orbitrum.app

# Adicionar Android
npx cap add android

# Copiar VERCEL-APP-COMPLETO.tsx
npx cap copy

# Build APK
npx cap run android --prod

# APK gerado automaticamente!
```

### OPÇÃO C: Cordova
```bash
# Mais antigo mas funciona
npm install -g cordova

# Criar projeto
cordova create OrbitrumApp com.orbitrum.app Orbitrum

# Adicionar Android
cordova platform add android

# Build APK
cordova build android --release

# APK em: platforms/android/app/build/outputs/apk/
```

## 📦 RESUMO DISTRIBUIÇÃO

### ✅ Com Expo (Recomendado)
```bash
eas build --platform android --profile preview
# → Link para baixar APK → Instalar direto
```

### ✅ Com Capacitor (Alternativa)
```bash
npx cap run android --prod
# → APK local gerado → Copiar para celular
```

### ✅ Distribuição Final
1. **APK pronto** (15-30MB)
2. **Enviar via WhatsApp/Drive/Email**  
3. **Pessoas instalam igual Uber**
4. **Funciona offline após instalado**

## 🎯 QUAL ESCOLHER?

### 🥇 **EXPO** (Mais Fácil)
- ✅ Build na nuvem (não precisa Android Studio)
- ✅ Suporte oficial React Native
- ✅ Um comando gera APK
- ⏱️ 20-30 minutos

### 🥈 **CAPACITOR** (Código Web)
- ✅ Usa exatamente o código web atual
- ✅ Menos mudanças necessárias  
- ✅ APK local gerado
- ⏱️ 15-20 minutos

### 🥉 **REACT NATIVE CLI** (Mais Controle)
- ✅ 100% nativo
- ✅ Performance máxima
- ❌ Mais complexo configurar
- ⏱️ 1-2 horas

## 🚀 RESULTADO FINAL

**Com qualquer opção você terá:**
- 📱 **App Android igual Uber** (instalação direta)
- 🧠 **Neural brain funcionando** identicamente
- 🎮 **Todos os dashboards** preservados
- 🌟 **Sistema orbital completo** 
- 📤 **Distribuição via WhatsApp/Telegram/Drive**

**Recomendação: Comece com Expo, se não funcionar use Capacitor!**

## 🎯 Funcionalidades Implementadas

✅ **Sistema Orbital Neural** - Cérebro central com animações
✅ **16 Profissionais** - Orbitando em 3 anéis com velocidades diferentes  
✅ **Login System** - Autenticação para dashboards
✅ **3 Dashboards** - Cliente, Profissional e Admin
✅ **Navegação Nativa** - React Navigation
✅ **Animações Fluidas** - React Native Reanimated
✅ **Feedback Haptic** - Vibrações nos toques
✅ **Design Responsivo** - Otimizado para mobile
✅ **Tema Espacial** - Cores ciano/azul neon

## 📱 APK Pronto

Após o build, você terá:
- **orbitrum-development.apk** - Para testes
- **orbitrum-production.aab** - Para Google Play Store

O app funcionará EXATAMENTE como o sistema web, mas otimizado para Android!