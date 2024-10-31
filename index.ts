// server.ts
import express from 'express'
import type { Request, Response } from 'express'
import Redis from 'ioredis'
import cors from 'cors'

const app = express()
const redis = new Redis()
let uuid;

app.use(cors())
app.use(express.json())

function generateUniqueId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

// New endpoint to get userId
app.get('/register-user', async (req: Request, res: Response): Promise<void> => {
  const userId = generateUniqueId();
  res.json({ userId });
});

// Simplified click counter endpoint
app.post('/click-queue/:userId', async (req: Request, res: Response): Promise<void> => {
  const { userId } = req.params;
  if (!userId) {
    return res.status(400).json({ error: 'userId is required' });
  }

  try {
    // Use windowKey for rate limiting
    const windowKey = `clicks:${userId}:window`
    const count = await redis.incr(windowKey)
    
    // Set 10 second expiry on first click
    if (count === 1) {
      await redis.expire(windowKey, 10);
    }
    
    // Rate limiting
    if (count > 10) {
      return res.status(429).json({ error: 'Too many clicks' });
    }
    // Keep track of total clicks separately (if needed)
    const globalCount = await redis.incr(`globalCount-${userId}`);
    console.log(userId, 'has', globalCount, 'clicks')
    res.json({ clicks: globalCount });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

const PORT = 3090
app.listen(3090, () => {
  console.log('Server running on port', PORT)
})