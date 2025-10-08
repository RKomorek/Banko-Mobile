# 🏦 Banko Mobile

## 📋 Sobre o Projeto

**Banko Mobile** é um aplicativo de gestão financeira desenvolvido como projeto de pós-graduação. O aplicativo permite que os usuários gerenciem suas finanças pessoais de forma intuitiva e eficiente, oferecendo funcionalidades completas para controle de transações, visualização de métricas financeiras e análise de gastos.

### 🎯 Objetivo
Desenvolver uma solução mobile moderna e funcional para gestão financeira pessoal, demonstrando conhecimentos em desenvolvimento mobile com React Native, integração com Firebase e implementação de funcionalidades bancárias essenciais.

## ✨ Funcionalidades

### 🏠 **Dashboard Principal**
- **Saldo atual** em tempo real
- **Gráficos interativos** de entradas e saídas por mês
- **Métricas financeiras** detalhadas
- **Saudação personalizada** com nome do usuário

### 💰 **Gestão de Transações**
- **Adicionar transações** com diferentes métodos de pagamento:
  - 💳 Cartão de crédito/débito
  - 📄 Boleto bancário
  - ⚡ PIX
- **Editar transações** existentes
- **Upload de recibos** com armazenamento em nuvem
- **Categorização** por entrada/saída
- **Validação de dados** com feedback visual

### 📊 **Visualização e Análise**
- **Lista completa** de transações com filtros avançados:
  - Por tipo de pagamento
  - Por entrada/saída
  - Por período (data inicial e final)
- **Métricas financeiras** do mês atual:
  - Total de entradas e saídas
  - Comparação com mês anterior
  - Método de pagamento mais utilizado
  - Total de transações realizadas

### 👤 **Perfil do Usuário**
- **Informações pessoais** (nome, sobrenome, email)
- **Avatar personalizado** com iniciais
- **Logout seguro**

### 🔐 **Autenticação**
- **Login** com email e senha
- **Cadastro** de novos usuários
- **Criação automática** de conta bancária
- **Saldo inicial** de R$ 1.000,00 para novos usuários

## 🛠️ Tecnologias Utilizadas

### **Frontend**
- **React Native** - Framework para desenvolvimento mobile
- **Expo** - Plataforma de desenvolvimento e deploy
- **TypeScript** - Tipagem estática
- **React Navigation** - Navegação entre telas
- **React Hook Form** - Gerenciamento de formulários
- **Yup** - Validação de schemas

### **Backend & Serviços**
- **Firebase Authentication** - Autenticação de usuários
- **Cloud Firestore** - Banco de dados NoSQL
- **Firebase Storage** - Armazenamento de arquivos
- **Firebase Hosting** - Deploy da aplicação

### **UI/UX**
- **React Native Chart Kit** - Gráficos e visualizações
- **Expo Vector Icons** - Ícones personalizados
- **React Native Toast Message** - Notificações
- **Tema claro/escuro** automático
- **Design responsivo** e moderno

### **Ferramentas de Desenvolvimento**
- **ESLint** - Linting de código
- **Expo Router** - Roteamento baseado em arquivos
- **React Native Reanimated** - Animações fluidas
- **React Native Gesture Handler** - Gestos nativos

## 📱 Estrutura do Projeto

```
Banko-Mobile/
├── app/                          # Telas principais
│   ├── _layout.tsx              # Layout raiz
│   └── (tabs)/                  # Navegação por abas
│       ├── _layout.tsx          # Layout das abas
│       ├── index.tsx            # Dashboard principal
│       ├── transactions.tsx     # Lista de transações
│       ├── transaction-form.tsx # Formulário de transações
│       └── profile.tsx          # Perfil do usuário
├── components/                   # Componentes reutilizáveis
│   ├── auth-context.tsx         # Contexto de autenticação
│   ├── financial-metrics.tsx    # Métricas financeiras
│   ├── login-register.tsx       # Tela de login/cadastro
│   ├── receipt-upload-box.tsx   # Upload de recibos
│   ├── transactions/            # Componentes de transações
│   └── ui/                      # Componentes de interface
├── constants/                    # Constantes e temas
│   └── theme.ts                 # Configuração de temas
├── hooks/                       # Hooks customizados
├── firebase.ts                  # Configuração do Firebase
└── assets/                      # Recursos estáticos
    └── images/                  # Imagens e ícones
```

## 🚀 Como Executar

### **Pré-requisitos**
- Node.js (versão 18 ou superior)
- npm ou yarn
- Expo CLI
- Dispositivo móvel ou emulador

### **Instalação**

1. **Clone o repositório**
```bash
git clone https://github.com/seu-usuario/banko-mobile.git
cd banko-mobile
```

2. **Instale as dependências**
```bash
npm install
```

3. **Configure o Firebase**
   - Crie um projeto no [Firebase Console](https://console.firebase.google.com)
   - Configure Authentication, Firestore e Storage
   - Substitua as configurações em `firebase.ts`

4. **Execute o projeto**
```bash
# Desenvolvimento
npm start

# Android
npm run android

# iOS
npm run ios

# Web
npm run web
```

## 📊 Funcionalidades Técnicas

### **Gerenciamento de Estado**
- Context API para autenticação
- Estado local com React Hooks
- Persistência de dados no Firebase

### **Validação e Formulários**
- Validação em tempo real com Yup
- Feedback visual de erros
- Máscaras de entrada para valores monetários

### **Performance**
- Lazy loading de componentes
- Otimização de re-renders
- Cache de dados do Firebase

### **Segurança**
- Autenticação segura com Firebase Auth
- Validação de dados no frontend e backend
- Armazenamento seguro de arquivos

## 🎨 Design System

### **Cores**
- **Primária**: #e11d48 (Vermelho Banko)
- **Construtiva**: #1a9447 (Verde para entradas)
- **Destrutiva**: #d32a2aff (Vermelho para saídas)
- **Suporte**: Tema claro e escuro

### **Tipografia**
- **Fonte**: Lato (sans-serif)
- **Hierarquia**: Títulos, subtítulos e corpo de texto

### **Componentes**
- Cards com bordas arredondadas
- Botões com estados de hover/ativo
- Inputs com validação visual
- Ícones personalizados

## 📈 Métricas e Analytics

O aplicativo coleta e exibe:
- **Entradas mensais** com tendência
- **Saídas mensais** com comparação
- **Método de pagamento** mais utilizado
- **Total de transações** realizadas
- **Gráficos temporais** de movimentação

## 🔮 Próximas Funcionalidades

- [ ] **Categorização** de transações
- [ ] **Metas financeiras** e orçamentos
- [ ] **Relatórios** em PDF
- [ ] **Notificações** push
- [ ] **Backup** automático
- [ ] **Múltiplas contas** bancárias
- [ ] **Integração** com bancos reais

## 👥 Equipe de Desenvolvimento

**Projeto de Pós-Graduação**
- Desenvolvido como trabalho acadêmico
- Foco em tecnologias modernas
- Aplicação de boas práticas de desenvolvimento

## 📄 Licença

Este projeto foi desenvolvido para fins educacionais como parte de um curso de pós-graduação.

## 🤝 Contribuição

Este é um projeto acadêmico, mas sugestões e melhorias são bem-vindas através de issues ou pull requests.

---

**Banko Mobile** - Transformando a gestão financeira pessoal em uma experiência moderna e intuitiva. 💳✨