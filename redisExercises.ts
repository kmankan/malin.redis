import Redis from "ioredis"

// Initialize Redis client
const redis = new Redis({
  port: 6379,
  host: 'localhost',
});

//set/get
const basicSetGet = async () => {
  // We will set a simple key value pair
  await redis.set('greeting', 'Hello!');

  // We will get the value
  const value = await redis.get('greeting')
  console.log('retrieved:', value)


  // Set with expiration (5 seconds)
  await redis.set('temporary', 'I will disappear in 5 seconds', 'EX', 5);

   // Wait 4 seconds and try to get the expired key --> should succeed
   await new Promise(resolve => setTimeout(resolve, 4000));
   const tempValue = await redis.get('temporary') ?? 'could not find anything';
   console.log('Expired value:', tempValue);

  // Wait 6 seconds and try to get the expired key
  await new Promise(resolve => setTimeout(resolve, 6000));
  const expiredValue = await redis.get('temporary') ?? 'could not find anything';
  console.log('Expired value:', expiredValue); // Should be null
}

const workingWithLists = async () => {
  let currentList;
  // we clear the existing list
  await redis.del('mylist')

  // ! to retrieve a list we need to use redis.lrange()

  // push elements to the right of a list
  await redis.rpush('mylist', 'A')
  currentList = await redis.lrange('mylist', 0, -1) // Get all elements
  console.log(currentList)
  await redis.rpush('mylist', 'B')
  currentList = await redis.lrange('mylist', 0, -1)
  console.log(currentList)
  await redis.rpush('mylist', 'C')
  currentList = await redis.lrange('mylist', 0, -1)
  console.log(currentList)

  // push elements to the left of a list
  await redis.lpush('mylist', 'D')
  currentList = await redis.lrange('mylist', 0, -1)
  console.log(currentList)
  await redis.lpush('mylist', 'E')
  currentList = await redis.lrange('mylist', 0, -1)
  console.log(currentList)
  await redis.lpush('mylist', 'F')
  currentList = await redis.lrange('mylist', 0, -1)
  console.log(currentList)
  // pop an element from the right
  const rightElement = await redis.rpop('mylist');
  console.log(rightElement)
  currentList = await redis.lrange('mylist', 0, -1)
  console.log(currentList)
}

const basicCounter = async () => {
  const key = 'visitor-count';

  // increment counter
  const count = await redis.incr(key) // returns the counter value stored in visit-counter
  console.log('current count', count)

  // get the counter value
  const currentCount = await redis.get(key)
  console.log('retrieved count', currentCount)
}

const basicRateLimiting = async (userId: string, limit: number = 5, windowSeconds: number = 1): Promise<boolean> => {
  const key = `ratelimit:${userId}`;

  // get the current count
  const count = await redis.incr(key);

  await redis.expire(key, windowSeconds); // key is valid for 10 seconds

  // check if the user exceeds the limit
  if (count > limit) {
    console.log('rate limit exceeded for', userId)
    return false
  }

  console.log(`request ${count} of ${limit} for user ${userId}`)
  return true
}


const main = async () => {
  const userId = 'alice'
  for (let i = 0; i < 10109; i++) {
    await basicRateLimiting(userId, 10009)
    //await new Promise(res => setTimeout(res, 1000)) // 1 second delay
  }


  await redis.quit();
}

main();