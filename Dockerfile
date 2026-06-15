FROM oven/bun:1.2-alpine

WORKDIR /app

# Copy package configuration and lockfile
COPY package.json bun.lock ./

# Install all dependencies for the build step
RUN bun install --frozen-lockfile

# Copy the source code and build the SvelteKit application
COPY . .
RUN bun run build

# Re-install only production dependencies to optimize image size
RUN bun install --frozen-lockfile --production

# Expose the port SvelteKit runs on
EXPOSE 5173

# Configure runtime environment
ENV PORT=5173
ENV NODE_ENV=production

# Run SvelteKit built server using Bun
CMD ["bun", "build/index.js"]
