@echo off
cd /d "%~dp0"
echo Preparando para subir los archivos a GitHub...
git push -u origin main
echo.
echo Presiona cualquier tecla para cerrar esta ventana...
pause >nul
