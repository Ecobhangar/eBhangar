@echo off
echo ============================================
echo  eBhangar Frontend Build Automation Script
echo ============================================
echo.

:: Change directory to client
cd /d E:\eBhangar\eBhangar\client

echo --- Running npm install ---
E:\PortableNode\node-v22.11.0-win-x64\npm.cmd install

echo --- Installing vite-static-copy ---
E:\PortableNode\node-v22.11.0-win-x64\npm.cmd install vite-plugin-static-copy --save-dev

echo --- Building frontend ---
E:\PortableNode\node-v22.11.0-win-x64\npm.cmd run build

echo.
echo ============================================
echo  Build Complete!
echo  Check the dist/ folder inside client/
echo ============================================
pause
