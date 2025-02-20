# 使用 Node.js 23.8.0 作为基础镜像
FROM node:23.8.0-alpine

# 设置工作目录
WORKDIR /app

# 复制 package.json 和 package-lock.json (如果存在)
COPY package*.json ./

# 安装依赖
RUN npm install

# 复制项目文件
COPY . .

# 构建应用
RUN npm run build

# 暴露端口 3000
EXPOSE 8200

# 启动应用
CMD ["npm", "start"]