FROM node:20-alpine as build
WORKDIR /app
COPY package.json ./
RUN npm install
COPY . .

# Set environment variables for build
ENV VITE_API_BASE=http://34.128.184.43.nip.io/api
ENV VITE_API_URL=http://34.128.184.43.nip.io/api
ENV VITE_GOOGLE_CLIENT_ID=1050334836326-2jg080g9dm516nqpql4vh8niocg17itv.apps.googleusercontent.com

RUN npm run build

FROM nginx:alpine
WORKDIR /usr/share/nginx/html
COPY --from=build /app/dist .
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 3000
CMD ["nginx", "-g", "daemon off;"]
