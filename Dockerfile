# Next.js 官方推荐的多阶段构建 Dockerfile
# 适用于生产环境，支持 pnpm

# 第一阶段：安装依赖并构建
FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
# RUN npm config set registry https://registry.npmmirror.com
RUN npm install -g pnpm && pnpm install --frozen-lockfile
COPY . .
RUN pnpm build

# 第二阶段：生产环境运行
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# 只复制必要的文件
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/next.config.mjs ./next.config.mjs
COPY --from=builder /app/next-env.d.ts ./next-env.d.ts
COPY --from=builder /app/tsconfig.json ./tsconfig.json

EXPOSE 3000
CMD ["pnpm", "start"]
