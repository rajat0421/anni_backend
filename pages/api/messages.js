// import { MongoClient } from 'mongodb';

// // Use local MongoDB URI for testing
// console.log("MongoDB URI:", process.env.MONGODB_URI);

// const uri = process.env.MONGODB_URI || 'mongodb+srv://rajattalekar5143:O8RMonXl9bOZDNdW@cluster0.boja6.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0'; // Default to local URI if env var is not set
// const client = new MongoClient(uri);

// export default async function handler(req, res) {
//   try {
//     await client.connect();
//     const database = client.db('chatapp'); // Database name
//     const messages = database.collection('messages'); // Collection name

//     if (req.method === 'GET') {
//       // Fetch all messages, sorted by timestamp
//       const result = await messages.find().sort({ timestamp: 1 }).toArray();
//       res.status(200).json(result);
//     } else if (req.method === 'POST') {
//       // Insert a new message
//       const result = await messages.insertOne(req.body);
//       res.status(201).json(result);
//     } else {
//       res.status(405).end(); // Method not allowed
//     }
//   } catch (error) {
//     console.error('Error handling messages:', error);
//     res.status(500).json({ error: 'Internal Server Error' });
//   } finally {
//     await client.close(); // Ensure client is closed
//   }
// }


import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI || 'mongodb+srv://rajattalekar5143:O8RMonXl9bOZDNdW@cluster0.boja6.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
const client = new MongoClient(uri);

export default async function handler(req, res) {
  try {
    // Connect to MongoDB
    await client.connect();
    const database = client.db('chatapp');
    const messages = database.collection('messages');

    if (req.method === 'GET') {
      // Fetch all messages, sorted by timestamp
      const result = await messages.find().sort({ timestamp: 1 }).toArray();
      res.status(200).json(result);
    } else if (req.method === 'POST') {
      // Insert a new message
      const result = await messages.insertOne(req.body);
      res.status(201).json(result);
    } else {
      res.status(405).end(); // Method not allowed
    }
  } catch (error) {
    console.error('Error handling messages:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  } finally {
    await client.close(); // Ensure client is closed
  }
}
