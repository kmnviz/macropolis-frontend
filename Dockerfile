FROM --platform=linux/amd64 node:18.15.0

ENV APP_NAME=Macropolis
ENV DOMAIN_NAME=macropolis.io
ENV DOMAIN_URL=https://macropolis.io
ENV BACKEND_URL=https://api.macropolis.io
ENV GCP_STORAGE_URL=
ENV GCP_STORAGE_IMAGES_BUCKET=
ENV GCP_STORAGE_AUDIO_PREVIEWS_BUCKET=
ENV GCP_STORAGE_PUBLIC_FILES=
ENV STRIPE_PUBLISHABLE_KEY=

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . /app

EXPOSE 8080

RUN npm run build

CMD [ "npm", "run", "start" ]
