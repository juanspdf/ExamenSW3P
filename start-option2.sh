#!/bin/bash

# ============================================
# Script de Inicio Rápido - OPCIÓN 2
# ============================================
# Todo dockerizado (servicios + bases de datos)
# ============================================

set -e

echo "=================================================="
echo "     Cooperativa - Opción 2: Todo Dockerizado"
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

echo -e "${GREEN}✅ Docker instalado: $(docker --version)${NC}"
echo -e "${GREEN}✅ Docker Compose instalado: $(docker-compose --version)${NC}"
echo ""

# Preguntar si construir imágenes
echo "2️⃣  Opciones de construcción:"
echo ""
echo "   [1] Construir imágenes (primera vez o después de cambios en código)"
echo "   [2] Usar imágenes existentes (más rápido)"
echo ""
read -p "Selecciona opción [1/2]: " BUILD_OPTION

if [ "$BUILD_OPTION" = "1" ]; then
    echo ""
    echo -e "${YELLOW}🔨 Construyendo imágenes Docker...${NC}"
    echo -e "${YELLOW}   (Esto puede tardar 5-10 minutos la primera vez)${NC}"
    echo ""
    
    docker-compose -f docker-compose.full.yml build
    
    echo ""
    echo -e "${GREEN}✅ Imágenes construidas correctamente${NC}"
fi

# Levantar todos los servicios
echo ""
echo "3️⃣  Levantando todos los servicios..."
echo ""

docker-compose -f docker-compose.full.yml up -d

echo ""
echo -e "${YELLOW}⏳ Esperando que los servicios estén listos...${NC}"
echo -e "${YELLOW}   (Bases de datos: 30s, Microservicios: 60-90s)${NC}"
echo ""

# Esperar a que las BDs estén ready
sleep 30

# Verificar estado cada 10 segundos
for i in {1..6}; do
    echo "   Verificando estado (intento $i/6)..."
    docker-compose -f docker-compose.full.yml ps
    
    # Verificar si todos están healthy
    HEALTHY=$(docker-compose -f docker-compose.full.yml ps | grep -c "healthy" || true)
    
    if [ "$HEALTHY" -ge 2 ]; then
        echo -e "${GREEN}   ✅ Servicios listos${NC}"
        break
    fi
    
    if [ $i -lt 6 ]; then
        sleep 10
    fi
done

# Estado final
echo ""
echo "4️⃣  Estado final de servicios:"
echo ""
docker-compose -f docker-compose.full.yml ps

# Verificación de endpoints
echo ""
echo "5️⃣  Verificando endpoints..."
echo ""

# Esperar un poco más si es necesario
sleep 5

# Test Cuentas
if curl -s http://localhost:3000/api-docs > /dev/null; then
    echo -e "${GREEN}✅ Microservicio de Cuentas: OK${NC}"
else
    echo -e "${RED}❌ Microservicio de Cuentas: No responde aún${NC}"
    echo "   Ver logs: docker logs cooperativa-cuentas-service"
fi

# Test Socios
if curl -s http://localhost:8080/actuator/health > /dev/null; then
    echo -e "${GREEN}✅ Microservicio de Socios: OK${NC}"
else
    echo -e "${RED}❌ Microservicio de Socios: No responde aún${NC}"
    echo "   Ver logs: docker logs cooperativa-socios-service"
fi

# Test phpMyAdmin
if curl -s http://localhost:8081 > /dev/null; then
    echo -e "${GREEN}✅ phpMyAdmin: OK${NC}"
else
    echo -e "${YELLOW}⚠️  phpMyAdmin: No responde aún${NC}"
fi

# Resultados
echo ""
echo "=================================================="
echo -e "${GREEN}✅ SISTEMA LEVANTADO${NC}"
echo "=================================================="
echo ""
echo "🌐 URLs de acceso:"
echo "   • Cuentas:     http://localhost:3000"
echo "   • Cuentas API: http://localhost:3000/api-docs"
echo "   • Socios:      http://localhost:8080/api/socios"
echo "   • Socios API:  http://localhost:8080/swagger-ui.html"
echo "   • Health:      http://localhost:8080/actuator/health"
echo "   • phpMyAdmin:  http://localhost:8081"
echo ""
echo "📊 Comandos útiles:"
echo "   • Ver logs:    docker-compose -f docker-compose.full.yml logs -f"
echo "   • Ver estado:  docker-compose -f docker-compose.full.yml ps"
echo "   • Detener:     docker-compose -f docker-compose.full.yml down"
echo "   • Reiniciar:   docker-compose -f docker-compose.full.yml restart"
echo ""
echo "🔍 Ver logs de un servicio específico:"
echo "   docker logs -f cooperativa-cuentas-service"
echo "   docker logs -f cooperativa-socios-service"
echo ""
echo "📖 Ver documentación completa en README-UBUNTU.md"
echo "=================================================="
