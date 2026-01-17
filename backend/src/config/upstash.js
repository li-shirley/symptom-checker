import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

// limiter for auth protected routes 
export const authRatelimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(100, "15 m"),
    analytics: true,
    prefix: "rl:auth",
});

// public routes limiter
export const guestRatelimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, "1 m"), 
    analytics: true,
    prefix: "rl:guest",
});

// symptom check-associated routes limiter
export const symptomCheckRatelimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(25, "1 m"), 
    analytics: true,
    prefix: "rl:symptom",
});

export { redis };
