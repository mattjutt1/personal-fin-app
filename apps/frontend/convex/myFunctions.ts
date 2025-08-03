import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const sum = query({
  args: {
    numbers: v.array(v.float64()),
  },
  handler: async (ctx, args) => {
    const totalSum = args.numbers.reduce((acc, num) => acc + num, 0);
    return { sum: totalSum };
  },
});

export const hello = query({
  handler: async () => {
    return { message: "Hello from Convex!" };
  },
});
