@echo off
REM ===================================================================
REM Online Medicine Delivery System - Quick Setup Script (Windows)
REM ===================================================================
REM This script will help you set up the development environment quickly
REM 
REM Usage: Double-click setup.bat or run from Command Prompt
REM ===================================================================

setlocal enabledelayedexpansion

echo.
echo ╔═══════════════════════════════════════════════════════════════╗
echo ║          Online Medicine Delivery System Setup               ║
echo ║                  Local Development Environment                ║
echo ╚═══════════════════════════════════════════════════════════════╝
echo.

REM Step 1: Check prerequisites
echo [STEP 1] Checking prerequisites...

REM Check Node.js
node --version >nul 2>&1
if errorlevel 1 (
    echo ✗ Node.js is not installed. Please install Node.js 18+ from https://nodejs.org/
    pause
    exit /b 1
)
echo ✓ Node.js found

REM Check npm
npm --version >nul 2>&1
if errorlevel 1 (
    echo ✗ npm is not installed. Please install npm.
    pause
    exit /b 1
)
echo ✓ npm found

REM Check Docker
docker --version >nul 2>&1
if errorlevel 1 (
    echo ✗ Docker is not installed. Please install Docker Desktop from https://www.docker.com/
    pause
    exit /b 1
)
echo ✓ Docker found

REM Check Docker Compose
docker-compose --version >nul 2>&1
if errorlevel 1 (
    docker compose version >nul 2>&1
    if errorlevel 1 (
        echo ✗ Docker Compose is not installed. Please install Docker Compose.
        pause
        exit /b 1
    ) else (
        echo ✓ Docker Compose found
        set COMPOSE_CMD=docker compose
    )
) else (
    echo ✓ Docker Compose found
    set COMPOSE_CMD=docker-compose
)

REM Step 2: Setup environment files
echo.
echo [STEP 2] Setting up environment files...

if not exist .env (
    copy .env.example .env >nul
    echo ✓ Created .env file from template
    echo ⚠ Please edit .env file with your configuration before starting services
) else (
    echo ⚠ .env file already exists, skipping creation
)

REM Create service-specific .env files
call :create_service_env auth 3001
call :create_service_env catalog 3002
call :create_service_env order 3003
call :create_service_env delivery 3004
call :create_service_env notification 3005

REM Gateway .env
if not exist gateway\.env (
    (
        echo NODE_ENV=development
        echo PORT=8080
        echo AUTH_SERVICE_URL=http://localhost:3001
        echo CATALOG_SERVICE_URL=http://localhost:3002
        echo ORDER_SERVICE_URL=http://localhost:3003
        echo DELIVERY_SERVICE_URL=http://localhost:3004
        echo NOTIFICATION_SERVICE_URL=http://localhost:3005
        echo CORS_ORIGIN=http://localhost:5173
    ) > gateway\.env
    echo ✓ Created gateway\.env
)

REM Frontend .env
if not exist web\.env (
    (
        echo VITE_API_URL=http://localhost:8080
        echo VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
    ) > web\.env
    echo ✓ Created web\.env
)

REM Step 3: Install dependencies
echo.
echo [STEP 3] Installing dependencies...

call :install_deps gateway
call :install_deps services\auth
call :install_deps services\catalog
call :install_deps services\order
call :install_deps services\delivery
call :install_deps services\notification
call :install_deps web

REM Step 4: Docker setup
echo.
echo [STEP 4] Setting up Docker environment...

echo Pulling Docker images...
docker pull postgres:15
docker pull redis:7
docker pull rabbitmq:3-management
echo ✓ Docker images pulled

REM Step 5: Start infrastructure services
echo.
echo [STEP 5] Starting infrastructure services...
%COMPOSE_CMD% up -d postgres redis rabbitmq

echo Waiting for services to be ready...
timeout /t 10 /nobreak >nul

REM Check services (simplified for Windows)
echo Checking PostgreSQL...
for /l %%i in (1,1,30) do (
    docker exec -it postgres-container pg_isready -U postgres >nul 2>&1
    if not errorlevel 1 (
        echo ✓ PostgreSQL is ready
        goto :redis_check
    )
    timeout /t 2 /nobreak >nul
)
echo ✗ PostgreSQL failed to start
pause
exit /b 1

:redis_check
echo Checking Redis...
docker exec redis-container redis-cli ping >nul 2>&1
if not errorlevel 1 (
    echo ✓ Redis is ready
) else (
    echo ✗ Redis failed to start
    pause
    exit /b 1
)

echo Checking RabbitMQ...
for /l %%i in (1,1,30) do (
    docker exec rabbitmq-container rabbitmq-diagnostics -q ping >nul 2>&1
    if not errorlevel 1 (
        echo ✓ RabbitMQ is ready
        goto :init_db
    )
    timeout /t 2 /nobreak >nul
)
echo ✗ RabbitMQ failed to start
pause
exit /b 1

:init_db
REM Step 6: Initialize database
echo.
echo [STEP 6] Initializing database...
if exist scripts\db\init.sql (
    type scripts\db\init.sql | docker exec -i postgres-container psql -U postgres -d medsdb
    echo ✓ Database initialized with schema and seed data
) else (
    echo ⚠ Database initialization script not found at scripts\db\init.sql
)

REM Step 7: Create helper scripts
echo.
echo [STEP 7] Creating helper scripts...

REM Create check-health.bat
(
    echo @echo off
    echo echo === System Health Check ===
    echo echo.
    echo echo 1. Infrastructure Services:
    echo %COMPOSE_CMD% ps postgres redis rabbitmq
    echo echo.
    echo echo 2. Frontend:
    echo curl -s -I http://localhost:5173 ^| findstr "200 OK" ^>nul ^&^& echo Frontend OK ^|^| echo Frontend not running
    echo echo.
    echo echo === Health Check Complete ===
    echo pause
) > check-health.bat
echo ✓ Created check-health.bat script

REM Create start-docker.bat
(
    echo @echo off
    echo echo Starting all services with Docker Compose...
    echo %COMPOSE_CMD% up -d
    echo echo.
    echo echo Services started!
    echo echo Frontend: http://localhost:5173
    echo echo API Gateway: http://localhost:8080
    echo echo RabbitMQ Management: http://localhost:15672 ^(guest/guest^)
    echo echo.
    echo echo Press any key to exit...
    echo pause >nul
) > start-docker.bat
echo ✓ Created start-docker.bat script

REM Create stop-docker.bat
(
    echo @echo off
    echo echo Stopping all Docker services...
    echo %COMPOSE_CMD% down
    echo echo All services stopped!
    echo pause
) > stop-docker.bat
echo ✓ Created stop-docker.bat script

REM Final instructions
echo.
echo ╔═══════════════════════════════════════════════════════════════╗
echo ║                        Setup Complete!                       ║
echo ╚═══════════════════════════════════════════════════════════════╝
echo.
echo ✓ Setup completed successfully!
echo.
echo Next Steps:
echo 1. Configure Google OAuth in .env and web\.env files
echo 2. Configure email settings in .env file
echo 3. Start the application:
echo.
echo    Option A - Docker Compose (Recommended):
echo    Double-click start-docker.bat or run: %COMPOSE_CMD% up -d
echo.
echo    Option B - Manual development (Advanced):
echo    Start each service individually in separate command prompts
echo.
echo Useful Scripts:
echo • Health check: check-health.bat
echo • Start Docker: start-docker.bat  
echo • Stop Docker: stop-docker.bat
echo.
echo Application URLs:
echo • Frontend: http://localhost:5173
echo • API Gateway: http://localhost:8080
echo • RabbitMQ Management: http://localhost:15672 (guest/guest)
echo.
echo Default Admin Account:
echo • Email: admin@meds.com
echo • Password: Admin@123
echo.
echo ⚠ Remember to edit the .env files with your actual configuration!
echo.
echo Press any key to exit...
pause >nul
goto :eof

REM Functions
:create_service_env
set service=%1
set port=%2
set service_dir=services\%service%

if exist %service_dir% (
    if not exist %service_dir%\.env (
        (
            echo NODE_ENV=development
            echo PORT=%port%
            echo DATABASE_URL=postgresql://postgres:postgres@localhost:5432/medsdb
            echo JWT_SECRET=your-super-secret-jwt-key-for-development
            echo REDIS_URL=redis://localhost:6379
            echo RABBITMQ_URL=amqp://guest:guest@localhost:5672
        ) > %service_dir%\.env
        echo ✓ Created %service_dir%\.env
    )
)
goto :eof

:install_deps
set dir=%1
if exist %dir% (
    if exist %dir%\package.json (
        echo Installing dependencies in %dir%...
        pushd %dir%
        npm install >nul
        popd
        echo ✓ Dependencies installed in %dir%
    )
)
goto :eof
