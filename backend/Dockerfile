FROM oven/bun:1.2-alpine

WORKDIR /app

# Copy package.json and lockfile
COPY package.json bun.lock ./

# Install production dependencies
RUN bun install --frozen-lockfile --production

# Copy the rest of the application files
COPY . .

# Expose the API port
EXPOSE 3000

# Start the Elysia server
CMD ["bun", "run", "start"]
