# Stage 1: Build
FROM node:latest as build-stage

WORKDIR /app
COPY ./ /app
RUN npm install
RUN npm run build

# Stage 2: Deploy
FROM nginx:alpine

COPY --from=build-stage /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 3000

CMD ["nginx", "-g", "daemon off;"]