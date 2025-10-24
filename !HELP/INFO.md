<!-- @format -->

🍕 Food Delivery System - Multi-Tenant Application
A comprehensive, production-ready food delivery system built with Node.js, Express, MongoDB, Redis, Kafka, and Socket.IO. This application implements a multi-tenant architecture with real-time updates, event streaming, and live metrics.

📋 Table of Contents
Features
Technology Stack
Project Structure
Prerequisites
Installation
Configuration
Running the Application
API Documentation
Testing
Architecture
✨ Features

1. Authentication & Security (10 marks)
   ✅ JWT-based authentication for customers and restaurants
   ✅ Google OAuth SSO for customer login
   ✅ Helmet.js for security headers
   ✅ CORS configuration with credentials
   ✅ Secure cookies with httpOnly and sameSite flags
   ✅ Express session with Redis store
   ✅ MongoDB injection protection using express-mongo-sanitize
   ✅ Input validation using express-validator
   ✅ Multi-tenant architecture with unique tenant IDs per restaurant
   ✅ Tenant-scoped operations for all database queries
2. Caching & Rate Limiting (10 marks)
   ✅ Redis caching for restaurant and menu listings
   ✅ Tenant-isolated caching with tenant-specific keys
   ✅ Rate limiting per tenant using Redis
   ✅ Rate limiting per user/IP for different endpoints
   ✅ Tiered rate limiting (general, auth, order, tenant-specific)
   ✅ Automatic cache invalidation on data updates
3. Event Streaming & Real-Time Updates (10 marks)
   ✅ Kafka producer for order events
   ✅ Tenant-scoped event publishing with tenant ID in message key
   ✅ Order validation and tenant-scoped storage
   ✅ Kafka consumer for event processing
   ✅ Metrics aggregation (orders per minute, avg prep time)
   ✅ Redis-based metrics storage with tenant-specific keys
4. Socket.IO Integration (10 marks)
   ✅ Socket.IO server with Redis adapter for horizontal scaling
   ✅ Real-time order updates per tenant
   ✅ Namespace/room-based architecture for tenant isolation
   ✅ Live metrics broadcasting to connected clients
   ✅ JWT authentication for Socket.IO connections
   ✅ Auto-reconnection handling
5. Live Metrics Dashboard (10 marks)
   ✅ Beautiful HTML/CSS/JS dashboard with modern UI
   ✅ Chart.js integration for live charts
   ✅ Real-time orders per minute chart
   ✅ Tenant-specific metrics display
   ✅ WebSocket live updates
   ✅ Auto-refresh functionality
   ✅ Responsive design
   🛠 Technology Stack
   Backend Framework: Node.js with Express.js
   Database: MongoDB with Mongoose ODM
   Caching: Redis
   Message Queue: Apache Kafka (KafkaJS)
   Real-time Communication: Socket.IO with Redis adapter
   Authentication: JWT, Passport.js (Google OAuth 2.0)
   Security: Helmet, CORS, express-mongo-sanitize
   Validation: express-validator
   Session Management: express-session with connect-redis
   📁 Project Structure
   food-delivery-AWT/
   ├── config/
   │ ├── database.js # MongoDB connection
   │ ├── redis.js # Redis client configuration
   │ ├── kafka.js # Kafka producer/consumer setup
   │ └── passport.js # Passport strategies (JWT, Google OAuth)
   ├── middleware/
   │ ├── auth.js # Authentication & authorization middleware
   │ ├── rateLimiter.js # Rate limiting configurations
   │ └── validation.js # Input validation rules
   ├── models/
   │ ├── User.js # User model with tenant support
   │ ├── Restaurant.js # Restaurant model (tenant)
   │ ├── MenuItem.js # Menu item model (tenant-scoped)
   │ └── Order.js # Order model (tenant-scoped)
   ├── routes/
   │ ├── auth.js # Authentication routes
   │ ├── restaurants.js # Restaurant CRUD routes
   │ ├── menu.js # Menu item routes
   │ ├── orders.js # Order management routes
   │ └── metrics.js # Metrics API routes
   ├── kafka/
   │ ├── producer.js # Kafka event producer
   │ └── consumer.js # Kafka event consumer & metrics aggregator
   ├── socket/
   │ └── socketServer.js # Socket.IO server setup
   ├── utils/
   │ ├── cache.js # Caching utility functions
   │ └── jwt.js # JWT token utilities
   ├── public/
   │ └── dashboard.html # Live metrics dashboard
   ├── server.js # Main application entry point
   ├── package.json # Dependencies
   └── README.md # This file
   📦 Prerequisites
   Before running this application, ensure you have the following installed:

Node.js (v16 or higher)
MongoDB (v4.4 or higher)
Redis (v6 or higher) - Running on WSL or locally
Apache Kafka (v2.8 or higher) - Running on WSL or locally
WSL Setup (Windows Users)
If you're using WSL for Redis and Kafka:

Start Redis:

sudo service redis-server start
In kafka dir:

mkdir -p config/kraft
nano config/kraft/server.properties
then

process.roles=broker,controller
node.id=1
controller.listener.names=CONTROLLER
listeners=PLAINTEXT://:9092,CONTROLLER://:9093
inter.broker.listener.name=PLAINTEXT

log.dirs=/tmp/kraft-combined-logs
controller.quorum.voters=1@localhost:9093

num.partitions=1
offsets.topic.replication.factor=1
transaction.state.log.replication.factor=1
transaction.state.log.min.isr=1

log.retention.hours=168

In kafka dir:

bin/kafka-storage.sh format -t $(uuidgen) -c config/kraft/server.properties
In kafka dir:

bin/kafka-server-start.sh config/kraft/server.properties
🚀 Installation
Clone the repository:

git clone <repository-url>
cd food-delivery-AWT
Install dependencies:

npm install
Set up environment variables:

Create a .env file in the root directory (or update the existing one):

# Server Configuration

PORT=3000
NODE_ENV=development

# MongoDB

MONGODB_URI=mongodb:

# JWT

JWT_SECRET=your_super_secret_jwt_key_change_this
JWT_EXPIRE=7d

# Redis (WSL)

REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# Kafka (WSL)

KAFKA_BROKERS=localhost:9092
KAFKA_CLIENT_ID=food-delivery-app

# Google OAuth

GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback

# Session Secret

SESSION_SECRET=your_super_secret_session_key

# Frontend URL

FRONTEND_URL=http://localhost:3000
Create Kafka topic:

# In WSL Kafka bin directory

bin/kafka-topics.sh --create --topic order-events --bootstrap-server localhost:9092 --partitions 3 --replication-factor 1
▶️ Running the Application

1. Start the Main Server
   npm start

# or for development with auto-reload

npm run dev
The server will start on http://localhost:3000

2. Start the Kafka Consumer
   In a separate terminal:

npm run kafka-consumer 3. Access the Application
API Base URL: http://localhost:3000
Live Dashboard: http://localhost:3000/dashboard.html
Health Check: http://localhost:3000/health
📚 API Documentation
Authentication Endpoints
Register User
POST /api/auth/register
Content-Type: application/json

{
"name": "John Doe",
"email": "john@example.com",
"password": "password123",
"role": "customer" // or "restaurant"
}
Login
POST /api/auth/login
Content-Type: application/json

{
"email": "john@example.com",
"password": "password123"
}
Google OAuth
GET /api/auth/google
Restaurant Endpoints
Get All Restaurants
GET /api/restaurants?page=1&limit=10&city=Boston
Get Restaurant Menu
GET /api/restaurants/:restaurantId/menu
Order Endpoints
Create Order (Requires Authentication)
POST /api/orders
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
"restaurantId": "restaurant_id",
"items": [
{
"menuItemId": "item_id",
"quantity": 2,
"specialInstructions": "Extra cheese"
}
],
"deliveryAddress": {
"street": "123 Main St",
"city": "Boston",
"state": "MA",
"zipCode": "02101"
},
"paymentMethod": "card"
}
Update Order Status (Restaurant/Admin)
PUT /api/orders/:orderId/status
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
"status": "preparing"
}
Metrics Endpoints
Get Tenant Metrics
GET /api/metrics/:tenantId
🧪 Testing
Manual Testing Steps
Register a Restaurant:

curl -X POST http://localhost:3000/api/auth/register \
-H "Content-Type: application/json" \
-d '{
"name": "Pizza Palace",
"email": "pizza@example.com",
"password": "password123",
"role": "restaurant"
}'
Save the returned tenantId from the response

Open the Dashboard:

Navigate to http://localhost:3000/dashboard.html
Enter the tenantId
Click "Load Dashboard"
Create an Order:

# First, register as a customer and get JWT token

# Then use the token to create an order

curl -X POST http://localhost:3000/api/orders \
-H "Content-Type: application/json" \
-H "Authorization: Bearer <your_jwt_token>" \
-d '{...order data...}'
Watch Live Updates:

The dashboard will show real-time updates
Kafka consumer will process events
Metrics will update automatically
🏗 Architecture
Multi-Tenant Design
Each restaurant gets a unique tenantId (UUID)
All database queries are scoped by tenantId
Caching is isolated per tenant
Rate limiting is applied per tenant
Events are partitioned by tenantId in Kafka
Data Flow
Order Creation:

Client → API → Validate → Save to DB → Publish to Kafka → Socket.IO Broadcast
Event Processing:

Kafka Topic → Consumer → Aggregate Metrics → Store in Redis → Broadcast via Socket.IO
Dashboard Updates:

Socket.IO → Real-time Charts → Auto-refresh from API
🔒 Security Features
Helmet.js: Sets security headers
CORS: Configured with credentials support
Rate Limiting: Multi-level (IP, user, tenant)
Input Sanitization: Prevents NoSQL injection
Input Validation: All endpoints validated
Secure Sessions: Redis-backed with secure cookies
JWT: Stateless authentication
Password Hashing: bcrypt with salt rounds
📊 Monitoring
Health check endpoint: /health
Real-time metrics dashboard
Console logging for all events
Kafka consumer metrics
Redis cache hit/miss tracking (can be extended)
🚀 Production Deployment
For production deployment:

Set NODE_ENV=production
Use strong secrets for JWT and sessions
Enable HTTPS
Configure Kafka replication
Set up Redis clustering
Use MongoDB replica sets
Implement proper logging (Winston, Morgan)
Add monitoring (PM2, New Relic, DataDog)
📝 License
This project is created for educational purposes.

👨‍💻 Author
Created for Advanced Web Technologies (AWT) course

Happy Coding! 🎉
