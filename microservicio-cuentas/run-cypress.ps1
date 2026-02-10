# Script para ejecutar pruebas E2E con Cypress
# Asegúrate de que el servidor esté corriendo antes de ejecutar este script

Write-Host "🚀 Iniciando pruebas E2E con Cypress..." -ForegroundColor Cyan
Write-Host ""
Write-Host "⚠️  Asegúrate de que el servidor esté corriendo en http://localhost:3000" -ForegroundColor Yellow
Write-Host "   Ejecuta en otra terminal: npm run start:dev" -ForegroundColor Yellow
Write-Host ""
Write-Host "Presiona Enter para continuar o Ctrl+C para cancelar..." -ForegroundColor Green
Read-Host

Write-Host "🧪 Ejecutando pruebas Cypress..." -ForegroundColor Green
npm run cypress:run

Write-Host ""
Write-Host "✅ Pruebas completadas!" -ForegroundColor Green
