#!/bin/bash

# ============================================
# Script para Detener Todos los Servicios
# ============================================

set -e

echo "=================================================="
echo "        Deteniendo Servicios de Cooperativa"
echo "=================================================="
echo ""

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "Selecciona qué detener:"
echo ""
echo "  [1] Solo bases de datos (Opción 1)"
echo "  [2] Todo el sistema dockerizado (Opción 2)"
echo "  [3] Todo + eliminar volúmenes (PERDERÁS LOS DATOS)"
echo "  [4] Cancelar"
echo ""
read -p "Opción [1/2/3/4]: " STOP_OPTION

case $STOP_OPTION in
    1)
        echo ""
        echo "Deteniendo bases de datos..."
        docker-compose down
        echo -e "${GREEN}✅ Bases de datos detenidas${NC}"
        echo ""
        echo "⚠️  Recuerda detener los microservicios con Ctrl+C en sus terminales"
        ;;
    2)
        echo ""
        echo "Deteniendo todo el sistema dockerizado..."
        docker-compose -f docker-compose.full.yml down
        echo -e "${GREEN}✅ Sistema detenido${NC}"
        echo ""
        echo "ℹ️  Los datos en las bases de datos se conservan"
        ;;
    3)
        echo ""
        echo -e "${RED}⚠️  ADVERTENCIA: Esto eliminará TODOS los datos de las bases de datos${NC}"
        read -p "¿Estás seguro? [y/N]: " CONFIRM
        
        if [ "$CONFIRM" = "y" ] || [ "$CONFIRM" = "Y" ]; then
            echo ""
            echo "Deteniendo y eliminando volúmenes..."
            docker-compose -f docker-compose.full.yml down -v 2>/dev/null || docker-compose down -v
            echo -e "${GREEN}✅ Todo eliminado incluyendo datos${NC}"
        else
            echo "Operación cancelada"
        fi
        ;;
    4)
        echo "Operación cancelada"
        exit 0
        ;;
    *)
        echo -e "${RED}Opción inválida${NC}"
        exit 1
        ;;
esac

echo ""
echo "=================================================="
echo "Comandos útiles adicionales:"
echo ""
echo "  • Ver contenedores: docker ps -a"
echo "  • Ver volúmenes:    docker volume ls"
echo "  • Limpiar sistema:  docker system prune"
echo "=================================================="
