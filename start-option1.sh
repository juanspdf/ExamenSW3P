#!/bin/bash

# ============================================
# Script de Inicio Rápido - OPCIÓN 1
# ============================================
# Solo bases de datos en Docker
# Microservicios ejecutados desde terminal
# ============================================

set -e

echo "=================================================="
echo "   Cooperativa - Opción 1: Solo Bases de Datos"
echo "=================================================="
echo ""

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Verificar prerequisitos
echo "1️⃣  Verificando prerequisitos..."
echo ""

if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker no está instalado${NC}"
    echo "Instalar con: sudo apt install docker.io"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}❌ Docker Compose no está instalado${NC}"
    echo "Instalar con: sudo apt install docker-compose"
    exit 1
fi

if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js no está instalado${NC}"
    echo "Instalar con: curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash - && sudo apt install nodejs"
    exit 1
fi

if ! command -v java &> /dev/null; then
    echo -e "${RED}❌ Java no está instalado${NC}"
    echo "Instalar con: sudo apt install openjdk-21-jdk"
    exit 1
fi

echo -e "${GREEN}✅ Docker instalado: $(docker --version)${NC}"
echo -e "${GREEN}✅ Docker Compose instalado: $(docker-compose --version)${NC}"
echo -e "${GREEN}✅ Node.js instalado: $(node --version)${NC}"
echo -e "${GREEN}✅ Java instalado: $(java -version 2>&1 | head -n 1)${NC}"
echo ""

# Levantar bases de datos
echo "2️⃣  Levantando bases de datos con Docker..."
echo ""

docker-compose up -d

echo ""
echo -e "${YELLOW}⏳ Esperando que las bases de datos estén listas (30 segundos)...${NC}"
sleep 30

# Verificar estado
echo ""
echo "3️⃣  Verificando estado de contenedores..."
echo ""
docker-compose ps

echo ""
echo -e "${GREEN}✅ Bases de datos levantadas correctamente${NC}"
echo ""

# Configurar microservicio de cuentas
echo "4️⃣  Configurando microservicio de cuentas..."
echo ""

cd microservicio-cuentas

if [ ! -f .env ]; then
    echo "   Copiando .env.example a .env..."
    cp .env.example .env
fi

if [ ! -d node_modules ]; then
    echo "   Instalando dependencias de npm..."
    npm install
else
    echo -e "${GREEN}   ✅ Dependencias de npm ya instaladas${NC}"
fi

cd ..

# Configurar microservicio de socios
echo ""
echo "5️⃣  Configurando microservicio de socios..."
echo ""

cd socios

if [ ! -f .env ]; then
    echo "   Copiando .env.example a .env..."
    cp .env.example .env
fi

# Verificar si ya está compilado
if [ ! -f target/socios-0.0.1-SNAPSHOT.jar ]; then
    echo "   Compilando con Maven (puede tardar varios minutos)..."
    ./mvnw clean package -DskipTests
else
    echo -e "${GREEN}   ✅ Ya está compilado${NC}"
fi

cd ..

# Instrucciones finales
echo ""
echo "=================================================="
echo -e "${GREEN}✅ CONFIGURACIÓN COMPLETADA${NC}"
echo "=================================================="
echo ""
echo "📋 SIGUIENTE PASO: Ejecutar los microservicios"
echo ""
echo "🔹 Terminal 1 - Microservicio de Cuentas (NestJS):"
echo "   cd microservicio-cuentas"
echo "   npm run start:dev"
echo ""
echo "🔹 Terminal 2 - Microservicio de Socios (Spring Boot):"
echo "   cd socios"
echo "   ./mvnw spring-boot:run"
echo ""
echo "🌐 URLs de acceso:"
echo "   • Cuentas:     http://localhost:3000"
echo "   • Cuentas API: http://localhost:3000/api-docs"
echo "   • Socios:      http://localhost:8080/api/socios"
echo "   • Socios API:  http://localhost:8080/swagger-ui.html"
echo "   • phpMyAdmin:  http://localhost:8081"
echo ""
echo "⛔ Para detener las bases de datos:"
echo "   docker-compose down"
echo ""
echo "📖 Ver documentación completa en README-UBUNTU.md"
echo "=================================================="
