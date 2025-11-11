#!/bin/bash

# Script de pruebas de validación de schemas
# Asegúrate de que el servidor esté corriendo en http://localhost:3000

echo "🧪 Pruebas de Validación - SmartFloors Backend"
echo "=============================================="
echo ""

# Colores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

BASE_URL="http://localhost:3000/api/v1"

echo "📋 Prueba 1: GET válido - Piso 1"
echo "--------------------------------"
curl -s "$BASE_URL/floors/1" | jq '.success'
echo ""

echo "📋 Prueba 2: GET inválido - ID no numérico"
echo "--------------------------------"
curl -s "$BASE_URL/floors/abc" | jq '.error'
echo ""

echo "📋 Prueba 3: GET inválido - ID fuera de rango (0)"
echo "--------------------------------"
curl -s "$BASE_URL/floors/0" | jq '.error'
echo ""

echo "📋 Prueba 4: GET inválido - ID muy alto (101)"
echo "--------------------------------"
curl -s "$BASE_URL/floors/101" | jq '.error'
echo ""

echo "📋 Prueba 5: GET válido - Historial con limit=50"
echo "--------------------------------"
curl -s "$BASE_URL/floors/1/history?limit=50" | jq '.success'
echo ""

echo "📋 Prueba 6: GET inválido - Historial con limit negativo"
echo "--------------------------------"
curl -s "$BASE_URL/floors/1/history?limit=-10" | jq '.error'
echo ""

echo "📋 Prueba 7: GET inválido - Historial con limit muy alto"
echo "--------------------------------"
curl -s "$BASE_URL/floors/1/history?limit=2000" | jq '.error'
echo ""

echo "📋 Prueba 8: GET válido - Predicciones a 30 minutos"
echo "--------------------------------"
curl -s "$BASE_URL/floors/1/predictions?minutesAhead=30" | jq '.success'
echo ""

echo "📋 Prueba 9: GET inválido - Predicciones con minutos < 10"
echo "--------------------------------"
curl -s "$BASE_URL/floors/1/predictions?minutesAhead=5" | jq '.error'
echo ""

echo "📋 Prueba 10: GET inválido - Predicciones con minutos > 180"
echo "--------------------------------"
curl -s "$BASE_URL/floors/1/predictions?minutesAhead=200" | jq '.error'
echo ""

echo "✅ Pruebas completadas"
echo ""
echo "Nota: Si ves 'true' en las pruebas válidas y objetos de error en las inválidas, ¡todo funciona correctamente! ✨"
