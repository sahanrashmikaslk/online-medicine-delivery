#!/bin/bash

# ===================================================================
# Online Medicine Delivery System - Quick Setup Script
# ===================================================================
# This script will help you set up the development environment quickly
# 
# Usage:
#   chmod +x setup.sh
#   ./setup.sh
#
# Or on Windows (Git Bash):
#   bash setup.sh
# ===================================================================

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Utility functions
print_step() {
    echo -e "\n${BLUE}==>${NC} ${1}"
}

print_success() {
    echo -e "${GREEN}✓${NC} ${1}"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} ${1}"
}

print_error() {
    echo -e "${RED}✗${NC} ${1}"
}

# Check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Main setup function
main() {
    echo -e "${GREEN}"
    echo "╔═══════════════════════════════════════════════════════════════╗"
    echo "║          Online Medicine Delivery System Setup               ║"
    echo "║                  Local Development Environment                ║"
    echo "╚═══════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"

    # Step 1: Check prerequisites
    print_step "Checking prerequisites..."
    
    if ! command_exists node; then
        print_error "Node.js is not installed. Please install Node.js 18+ from https://nodejs.org/"
        exit 1
    fi
    print_success "Node.js found: $(node --version)"

    if ! command_exists npm; then
        print_error "npm is not installed. Please install npm."
        exit 1
    fi
    print_success "npm found: $(npm --version)"

    if ! command_exists docker; then
        print_error "Docker is not installed. Please install Docker from https://www.docker.com/"
        exit 1
    fi
    print_success "Docker found: $(docker --version)"

    if ! command_exists docker-compose; then
        if ! docker compose version >/dev/null 2>&1; then
            print_error "Docker Compose is not installed. Please install Docker Compose."
            exit 1
        else
            print_success "Docker Compose found: $(docker compose version)"
            COMPOSE_CMD="docker compose"
        fi
    else
        print_success "Docker Compose found: $(docker-compose --version)"
        COMPOSE_CMD="docker-compose"
    fi

    # Step 2: Setup environment files
    print_step "Setting up environment files..."

    if [ ! -f .env ]; then
        cp .env.example .env
        print_success "Created .env file from template"
        print_warning "Please edit .env file with your configuration before starting services"
    else
        print_warning ".env file already exists, skipping creation"
    fi

    # Create service-specific .env files
    create_service_env() {
        local service=$1
        local port=$2
        local service_dir="services/$service"
        
        if [ -d "$service_dir" ] && [ ! -f "$service_dir/.env" ]; then
            cat > "$service_dir/.env" << EOF
NODE_ENV=development
PORT=$port
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/medsdb
JWT_SECRET=your-super-secret-jwt-key-for-development
REDIS_URL=redis://localhost:6379
RABBITMQ_URL=amqp://guest:guest@localhost:5672
EOF
            print_success "Created $service_dir/.env"
        fi
    }

    create_service_env "auth" "3001"
    create_service_env "catalog" "3002" 
    create_service_env "order" "3003"
    create_service_env "delivery" "3004"
    create_service_env "notification" "3005"

    # Gateway .env
    if [ ! -f "gateway/.env" ]; then
        cat > "gateway/.env" << EOF
NODE_ENV=development
PORT=8080
AUTH_SERVICE_URL=http://localhost:3001
CATALOG_SERVICE_URL=http://localhost:3002
ORDER_SERVICE_URL=http://localhost:3003
DELIVERY_SERVICE_URL=http://localhost:3004
NOTIFICATION_SERVICE_URL=http://localhost:3005
CORS_ORIGIN=http://localhost:5173
EOF
        print_success "Created gateway/.env"
    fi

    # Frontend .env
    if [ ! -f "web/.env" ]; then
        cat > "web/.env" << EOF
VITE_API_URL=http://localhost:8080
VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
EOF
        print_success "Created web/.env"
    fi

    # Step 3: Install dependencies
    print_step "Installing dependencies..."

    install_deps() {
        local dir=$1
        if [ -d "$dir" ] && [ -f "$dir/package.json" ]; then
            print_step "Installing dependencies in $dir..."
            cd "$dir"
            npm install
            cd - > /dev/null
            print_success "Dependencies installed in $dir"
        fi
    }

    install_deps "gateway"
    install_deps "services/auth"
    install_deps "services/catalog"
    install_deps "services/order"
    install_deps "services/delivery"
    install_deps "services/notification"
    install_deps "web"

    # Step 4: Docker setup
    print_step "Setting up Docker environment..."

    # Pull required images
    print_step "Pulling Docker images..."
    docker pull postgres:15
    docker pull redis:7
    docker pull rabbitmq:3-management
    print_success "Docker images pulled"

    # Step 5: Start infrastructure services
    print_step "Starting infrastructure services..."
    $COMPOSE_CMD up -d postgres redis rabbitmq

    # Wait for services to be ready
    print_step "Waiting for services to be ready..."
    sleep 10

    # Check PostgreSQL
    for i in {1..30}; do
        if docker exec $($COMPOSE_CMD ps -q postgres) pg_isready -U postgres >/dev/null 2>&1; then
            print_success "PostgreSQL is ready"
            break
        fi
        if [ $i -eq 30 ]; then
            print_error "PostgreSQL failed to start"
            exit 1
        fi
        sleep 2
    done

    # Check Redis
    if docker exec $($COMPOSE_CMD ps -q redis) redis-cli ping >/dev/null 2>&1; then
        print_success "Redis is ready"
    else
        print_error "Redis failed to start"
        exit 1
    fi

    # Check RabbitMQ
    for i in {1..30}; do
        if docker exec $($COMPOSE_CMD ps -q rabbitmq) rabbitmq-diagnostics -q ping >/dev/null 2>&1; then
            print_success "RabbitMQ is ready"
            break
        fi
        if [ $i -eq 30 ]; then
            print_error "RabbitMQ failed to start"
            exit 1
        fi
        sleep 2
    done

    # Step 6: Initialize database
    print_step "Initializing database..."
    if [ -f "scripts/db/init.sql" ]; then
        docker exec -i $($COMPOSE_CMD ps -q postgres) psql -U postgres -d medsdb < scripts/db/init.sql
        print_success "Database initialized with schema and seed data"
    else
        print_warning "Database initialization script not found at scripts/db/init.sql"
    fi

    # Step 7: Create helper scripts
    print_step "Creating helper scripts..."

    # Health check script
    cat > check-health.sh << 'EOF'
#!/bin/bash
echo "=== System Health Check ==="

echo "1. Infrastructure Services:"
docker-compose ps postgres redis rabbitmq

echo -e "\n2. Database Connection:"
docker exec $(docker-compose ps -q postgres) pg_isready -U postgres

echo -e "\n3. Redis Connection:"
docker exec $(docker-compose ps -q redis) redis-cli ping

echo -e "\n4. RabbitMQ Connection:"
docker exec $(docker-compose ps -q rabbitmq) rabbitmq-diagnostics -q ping

echo -e "\n5. Service Health Endpoints:"
curl -s http://localhost:8080/auth/health || echo "Auth service not running"
curl -s http://localhost:8080/catalog/health || echo "Catalog service not running"
curl -s http://localhost:8080/orders/health || echo "Order service not running" 
curl -s http://localhost:8080/delivery/health || echo "Delivery service not running"

echo -e "\n6. Frontend:"
curl -s -I http://localhost:5173 | head -1 || echo "Frontend not running"

echo -e "\n=== Health Check Complete ==="
EOF
    chmod +x check-health.sh
    print_success "Created check-health.sh script"

    # Start services script
    cat > start-services.sh << 'EOF'
#!/bin/bash
echo "Starting all services..."

# Start infrastructure
docker-compose up -d postgres redis rabbitmq
sleep 5

# Function to start a service in background
start_service() {
    local service=$1
    local dir=$2
    echo "Starting $service..."
    cd "$dir"
    npm run dev > "../logs/$service.log" 2>&1 &
    echo $! > "../logs/$service.pid"
    cd - > /dev/null
}

# Create logs directory
mkdir -p logs

# Start all services
start_service "auth" "services/auth"
start_service "catalog" "services/catalog"
start_service "order" "services/order"
start_service "delivery" "services/delivery"
start_service "notification" "services/notification"
start_service "gateway" "gateway"

echo "Waiting for services to start..."
sleep 10

# Start frontend
echo "Starting frontend..."
cd web
npm run dev > "../logs/frontend.log" 2>&1 &
echo $! > "../logs/frontend.pid"
cd - > /dev/null

echo "All services started!"
echo "Frontend: http://localhost:5173"
echo "API Gateway: http://localhost:8080"
echo "RabbitMQ Management: http://localhost:15672 (guest/guest)"
echo ""
echo "To stop services, run: ./stop-services.sh"
EOF
    chmod +x start-services.sh
    print_success "Created start-services.sh script"

    # Stop services script  
    cat > stop-services.sh << 'EOF'
#!/bin/bash
echo "Stopping all services..."

# Stop Node.js services
if [ -d "logs" ]; then
    for pidfile in logs/*.pid; do
        if [ -f "$pidfile" ]; then
            pid=$(cat "$pidfile")
            if kill -0 "$pid" 2>/dev/null; then
                echo "Stopping service with PID $pid"
                kill "$pid"
            fi
            rm -f "$pidfile"
        fi
    done
fi

# Stop Docker services
docker-compose down

echo "All services stopped!"
EOF
    chmod +x stop-services.sh
    print_success "Created stop-services.sh script"

    # Step 8: Final instructions
    echo -e "\n${GREEN}"
    echo "╔═══════════════════════════════════════════════════════════════╗"
    echo "║                        Setup Complete!                       ║"
    echo "╚═══════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"

    print_success "Setup completed successfully!"
    echo ""
    echo -e "${YELLOW}Next Steps:${NC}"
    echo "1. Configure Google OAuth in .env and web/.env files"
    echo "2. Configure email settings in .env file"
    echo "3. Start the application:"
    echo ""
    echo -e "   ${BLUE}Option A - Docker Compose (Recommended for beginners):${NC}"
    echo "   docker-compose up -d"
    echo ""
    echo -e "   ${BLUE}Option B - Individual Services (For development):${NC}"
    echo "   ./start-services.sh"
    echo ""
    echo -e "${YELLOW}Useful Commands:${NC}"
    echo "• Health check: ./check-health.sh"
    echo "• Stop services: ./stop-services.sh"
    echo "• View logs: docker-compose logs [service-name]"
    echo "• Database access: docker exec -it \$(docker-compose ps -q postgres) psql -U postgres -d medsdb"
    echo ""
    echo -e "${YELLOW}Application URLs:${NC}"
    echo "• Frontend: http://localhost:5173"
    echo "• API Gateway: http://localhost:8080"
    echo "• RabbitMQ Management: http://localhost:15672 (guest/guest)"
    echo ""
    echo -e "${YELLOW}Default Admin Account:${NC}"
    echo "• Email: admin@meds.com"
    echo "• Password: Admin@123"
    echo ""
    print_warning "Remember to edit the .env files with your actual configuration before starting!"
}

# Run main function
main "$@"
