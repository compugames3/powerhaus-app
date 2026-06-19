@echo off
color 0B
echo ========================================================
echo        PUBLICADOR DE ACTUALIZACIONES - POWERHAUS
echo ========================================================
echo.

IF "%GH_TOKEN%"=="" (
    color 0E
    echo [ALERTA] No tienes configurado tu Token secreto de GitHub.
    echo.
    echo Por favor, pega tu Token ^(suele empezar por ghp_^...^) y presiona Enter:
    set /p NEW_TOKEN=
    setx GH_TOKEN "%NEW_TOKEN%"
    set GH_TOKEN=%NEW_TOKEN%
    echo.
    echo Token guardado exitosamente para el futuro en tu Windows.
    echo.
    color 0B
) ELSE (
    echo Token de GitHub detectado correctamente.
    echo.
)

echo Preparando los archivos y subiendo codigo fuente a GitHub...
git push -u origin main
echo.
echo Iniciando proceso de compilacion y publicacion (Esto tomara unos minutos)...
call npm run publish
echo.
color 0A
echo ========================================================
echo PROCESO FINALIZADO.
echo Si todo salio bien (sin letras rojas de error), tu
echo actualizacion ya esta publicada y lista para descargar!
echo ========================================================
pause
