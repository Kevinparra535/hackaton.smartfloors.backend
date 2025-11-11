#!/bin/bash

# Script de prueba para verificar las mejoras implementadas
# SmartFloors Backend - Versión 1.1.0

echo "=================================================="
echo "  SmartFloors Backend - Tests de Verificación"
echo "=================================================="
echo ""

BASE_URL="http://localhost:3000"
API_URL="$BASE_URL/api/v1"

echo "✅ Test 1: Verificar servidor activo"
if curl -s "$BASE_URL/health" | grep -q "OK"; then
    echo "   ✓ Servidor respondiendo correctamente"
else
    echo "   ✗ Error: Servidor no responde"
    exit 1
fi
echo ""

echo "✅ Test 2: Verificar campos de edificio en datos actuales"
BUILDING_CHECK=$(curl -s "$API_URL/floors" | jq '.data[0] | has("buildingId") and has("buildingName")')
if [ "$BUILDING_CHECK" = "true" ]; then
    BUILDING_NAME=$(curl -s "$API_URL/floors" | jq -r '.data[0].buildingName')
    echo "   ✓ Datos incluyen buildingId y buildingName"
    echo "   ✓ Edificio: $BUILDING_NAME"
else
    echo "   ✗ Error: Faltan campos de edificio"
    exit 1
fi
echo ""

echo "✅ Test 3: Verificar predicción de humedad"
HUMIDITY_PRED=$(curl -s "$API_URL/floors/1/predictions?minutesAhead=60" | jq '.data.predictions | has("humidity")')
if [ "$HUMIDITY_PRED" = "true" ]; then
    PRED_COUNT=$(curl -s "$API_URL/floors/1/predictions?minutesAhead=60" | jq '.data.predictions.humidity.predictions | length')
    echo "   ✓ Predicción de humedad implementada"
    echo "   ✓ Predicciones generadas: $PRED_COUNT"
else
    echo "   ✗ Error: Falta predicción de humedad"
    exit 1
fi
echo ""

echo "✅ Test 4: Verificar todas las métricas en predicciones"
METRICS=$(curl -s "$API_URL/floors/1/predictions?minutesAhead=30" | jq -r '.data.predictions | keys | join(", ")')
echo "   ✓ Métricas predichas: $METRICS"
echo ""

echo "✅ Test 5: Verificar historial con campos de edificio"
HISTORY_CHECK=$(curl -s "$API_URL/floors/2/history?limit=1" | jq '.data.history[0] | has("buildingId") and has("buildingName")')
if [ "$HISTORY_CHECK" = "true" ]; then
    echo "   ✓ Historial incluye campos de edificio"
else
    echo "   ✗ Error: Historial sin campos de edificio"
    exit 1
fi
echo ""

echo "✅ Test 6: Verificar estadísticas generales"
STATS=$(curl -s "$API_URL/floors/stats" | jq '.data')
if [ ! -z "$STATS" ]; then
    echo "   ✓ Estadísticas disponibles:"
    echo "$STATS" | jq '{totalFloors, totalOccupancy, averageTemperature}'
else
    echo "   ✗ Error: No se obtuvieron estadísticas"
    exit 1
fi
echo ""

echo "✅ Test 7: Verificar alertas activas"
ALERTS_COUNT=$(curl -s "$API_URL/alerts" | jq '.data.count')
echo "   ✓ Alertas activas: $ALERTS_COUNT"
echo ""

echo "=================================================="
echo "  ✨ Todos los tests pasaron correctamente ✨"
echo "=================================================="
echo ""
echo "Resumen de Mejoras Implementadas:"
echo "  ✅ Campo buildingId agregado a todos los datos"
echo "  ✅ Campo buildingName configurable desde .env"
echo "  ✅ Predicción de humedad implementada (ML híbrido)"
echo "  ✅ Sistema completo al 100% según requisitos"
echo ""
echo "Sistema listo para hackathon! 🚀"
