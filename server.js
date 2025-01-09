const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { MongoClient } = require('mongodb');

const app = express();
const server = http.createServer(app);

const allowedOrigins = [
  'https://aalupuri.vercel.app',
  'http://localhost:3000'
];

// Configure CORS middleware
app.use(cors({
  origin: function(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, origin);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
  credentials: true,
  optionsSuccessStatus: 204
}));

// Configure Socket.IO
const io = new Server(server, {
  cors: {
    origin: function(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, origin);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ["GET", "POST"],
    credentials: true,
    allowedHeaders: ['Content-Type'], // Only allow necessary headers
  },
  transports: ['websocket','polling'],
  path: '/socket.io/',
  pingTimeout: 60000,
  pingInterval: 25000,
});


// Parse JSON requests
app.use(express.json());


// MongoDB connection
const uri = process.env.MONGODB_URI || 'mongodb+srv://rajattalekar5143:O8RMonXl9bOZDNdW@cluster0.boja6.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
const client = new MongoClient(uri);

async function connectToMongo() {
  try {
    await client.connect();
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Could not connect to MongoDB", error);
  }
}

connectToMongo();

app.use(async (req, res, next) => {
  const userIP = (req.headers['x-forwarded-for'] || req.socket.remoteAddress || '').split(',')[0].trim();
  const log = {
    ip: userIP,
    method: req.method,
    url: req.url,
    timestamp: new Date(),
  };

  try {
    if (client && client.topology && client.topology.isConnected()) {
      const database = client.db('chatapp');
      const logs = database.collection('access_logs');
      await logs.insertOne(log);
    } else {
      console.warn('MongoDB not connected, skipping log');
    }
  } catch (error) {
    console.error('Error saving log to MongoDB:', error);
  } finally {
    next();
  }
});



// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('A user connected');
  
  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });

  socket.on('message', (message) => {
    io.emit('message', message);
  });

  socket.on('error', (error) => {
    console.error('Socket error:', error);
  });
});

// API endpoints
app.get('/api/messages', async (req, res) => {
  try {
    const database = client.db('chatapp');
    const messages = database.collection('messages');
    const result = await messages.find().sort({ timestamp: 1 }).toArray();
    res.json(result);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/api/messages', async (req, res) => {
  try {
    const database = client.db('chatapp');
    const messages = database.collection('messages');
    const result = await messages.insertOne(req.body);
    io.emit('message', req.body);
    res.status(201).json(result);
  } catch (error) {
    console.error('Error inserting message:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});