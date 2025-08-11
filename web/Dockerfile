FROM node:20-alpine as build
WORKDIR /app
COPY package.json ./
RUN npm install
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY --from=build /app/dist ./dist
# Use a simple static server via vite preview for demo
RUN npm install vite@5.4.0
EXPOSE 5173
CMD ["npx","vite","preview","--port","5173","--host"]
