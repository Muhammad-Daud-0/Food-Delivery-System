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
  then add

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
▶️ Running the Application:

  1. Start the Main Server
     npm start

    # or for development with auto-reload

    npm run dev
    The server will start on http://localhost:3000

  2. Start the Kafka Consumer
   In a separate terminal:

    npm run kafka-consumer 
    
  3. Access the Application
     
    API Base URL: http://localhost:3000
    Live Dashboard: http://localhost:3000/dashboard.html
    Health Check: http://localhost:3000/health
