# 构建阶段
FROM --platform=$BUILDPLATFORM node:23.8.0-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# 生产阶段
FROM --platform=$TARGETPLATFORM node:23.8.0-alpine AS runner

WORKDIR /app

# 只复制生产环境需要的文件
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules

# 仅安装生产依赖
ENV NODE_ENV production
ENV PORT 8200
RUN npm install --production

EXPOSE 8200

CMD ["npm", "start"]