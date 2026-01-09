#!/bin/bash
# QUICK START: Zustand no Banko-Mobile

echo "🚀 Iniciando setup do Zustand..."

# 1. Instalar Zustand
echo "📦 Instalando Zustand..."
npm install zustand --legacy-peer-deps

if [ $? -eq 0 ]; then
  echo "✅ Zustand instalado com sucesso!"
else
  echo "❌ Erro ao instalar Zustand"
  exit 1
fi

# 2. Verificar estrutura
echo ""
echo "📁 Verificando estrutura de stores..."

STORES_DIR="shared/stores"
if [ -d "$STORES_DIR" ]; then
  echo "✅ Diretório $STORES_DIR existe"
  echo ""
  echo "📋 Arquivos de stores:"
  ls -la "$STORES_DIR"/*.ts
else
  echo "❌ Diretório $STORES_DIR não encontrado"
  exit 1
fi

# 3. Confirmar instalação
echo ""
echo "✅ Setup completo! Agora:"
echo ""
echo "1️⃣  INSTALE AS DEPENDÊNCIAS:"
echo "   npm install"
echo ""
echo "2️⃣  TESTE A APP:"
echo "   npm start"
echo ""
echo "3️⃣  COMECE A USAR ZUSTAND:"
echo "   import { useAuthStore } from '@/shared/stores';"
echo "   const { user, logout } = useAuthStore();"
echo ""
echo "📚 DOCUMENTAÇÃO:"
echo "   • ZUSTAND_IMPLEMENTADO.md - Guia completo"
echo "   • shared/stores/GUIA_COMPLETO_ZUSTAND.ts - Exemplos práticos"
echo "   • shared/stores/EXEMPLOS_USO.ts - Padrões de uso"
echo ""
echo "🎉 Pronto para usar Zustand no Banko-Mobile!"
