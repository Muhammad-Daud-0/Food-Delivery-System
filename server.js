/** @format */

require("dotenv").config();
const express = require("express");
const http = require("http");
const helmet = require("helmet");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const RedisStore = require("connect-redis").default;
const mongoSanitize = require("express-mongo-sanitize");
const passport = require("./config/passport");
const connectDB = require("./config/database");
const { connectRedis, getRedisClient } = require("./config/redis");
const { initProducer } = require("./kafka/producer");
const { initSocketServer } = require("./socket/socketServer");
const { metricsAggregator } = require("./kafka/consumer");

const app = express();
const server = http.createServer(app);

connectDB();

let redisStore;
connectRedis()
	.then((client) => {
		redisStore = new RedisStore({
			client: client,
			prefix: "session:",
		});
		console.log("Redis store initialized for sessions");
	})
	.catch((err) => {
		console.error("Failed to connect to Redis:", err);
	});

initProducer().catch((err) => {
	console.error("Failed to initialize Kafka producer:", err);
});

metricsAggregator.initialize().catch((err) => {
	console.error("Failed to initialize metrics aggregator:", err);
});

app.use(
	helmet({
		contentSecurityPolicy: {
			directives: {
				defaultSrc: ["'self'"],
				connectSrc: [
					"'self'",
					"https://cdn.jsdelivr.net",
					"ws://localhost:3000",
					"http://localhost:3000",
				],
				styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
				scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
				scriptSrcAttr: ["'unsafe-inline'"],
				imgSrc: ["'self'", "data:", "https:"],
			},
		},
		crossOriginEmbedderPolicy: false,
	})
);

const corsOptions = {
	origin: process.env.FRONTEND_URL || "http://localhost:3000",
	credentials: true,
	optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

app.use(cookieParser());

app.use(
	session({
		store: redisStore,
		secret: process.env.SESSION_SECRET || "your-secret-key",
		resave: false,
		saveUninitialized: false,
		cookie: {
			secure: process.env.NODE_ENV === "production",
			httpOnly: true,
			maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
			sameSite: "strict",
		},
	})
);

app.use(passport.initialize());
app.use(passport.session());

app.use(mongoSanitize());

app.use(express.static("public"));

app.use("/api/auth", require("./routes/auth"));
app.use("/api/restaurants", require("./routes/restaurants"));
app.use("/api/menu", require("./routes/menu"));
app.use("/api/orders", require("./routes/orders"));
app.use("/api/metrics", require("./routes/metrics"));

app.get("/health", (req, res) => {
	res.status(200).json({
		success: true,
		message: "Server is running",
		timestamp: new Date().toISOString(),
	});
});

app.get("/", (req, res) => {
	res.redirect("/index.html");
});

app.use((req, res) => {
	res.status(404).json({
		success: false,
		message: "Route not found",
	});
});

app.use((err, req, res, next) => {
	console.error("Error:", err);
	res.status(err.status || 500).json({
		success: false,
		message: err.message || "Internal Server Error",
		error: process.env.NODE_ENV === "development" ? err : {},
	});
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, async () => {
	console.log(`

    🍕 Food Delivery System - Multi-Tenant API       
                                                      
     Server running on port ${PORT}                   
     Environment: ${process.env.NODE_ENV || "development"}
                                                      
     API: http://localhost:${PORT}                    
     Dashboard: http://localhost:${PORT}/dashboard.html  
                                                       
  `);

	try {
		await initSocketServer(server);
		console.log("Socket.IO server initialized");
	} catch (error) {
		console.error("Failed to initialize Socket.IO:", error);
	}
});

process.on("SIGTERM", async () => {
	console.log("SIGTERM received, shutting down gracefully...");
	server.close(async () => {
		console.log("Server closed");

		try {
			const redisClient = getRedisClient();
			await redisClient.quit();
			console.log("Redis connection closed");
		} catch (error) {
			console.error("Error closing Redis:", error);
		}

		process.exit(0);
	});
});

module.exports = { app, server };
