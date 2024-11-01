// server.ts
import express from 'express'
import type { Request, Response } from 'express'
import Redis from 'ioredis'
import cors from 'cors'

const app = express()
const redis = new Redis()

app.use(cors())
app.use(express.json())

app.post('/click/:id', async (req: Request, res:Response): Promise<void> => {
  const clickId = req.params.id
  const key = 'click-count'
  
  try {
    // Get current count in window
    const windowCount = await redis.incr(key)
    
    // Set 10 second expiry on first click in window
    if (windowCount === 1) {
      await redis.expire(key, 10)
    }
    
    // Check if over rate limit
    if (windowCount > 10) {
      console.log('clicks exceeded')
      return res.status(429).json({ 
        error: 'Too many clicks' 
      })
    }
    // track persistent number of clicks
    const persistentCount = await redis.incr(clickId)
    res.json({ clicks: persistentCount })
    console.log('current clicks', windowCount, 'total clicks', persistentCount)
  } catch (error) {
    res.status(500).json({ error: 'Server error' })
  }
})
const PORT = 3090
app.listen(3090, () => {
  console.log('Server running on port', PORT)
})