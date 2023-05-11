FROM --platform=linux/amd64 node:18.15.0

ENV APP_NAME=macropolis.io
ENV DOMAIN_NAME=testdomainaaa.xyz
ENV DOMAIN_URL=https://testdomainaaa.xyz
ENV BACKEND_URL=https://api.testdomainaaa.xyz
ENV GCP_STORAGE_URL=https://storage.googleapis.com
ENV GCP_STORAGE_IMAGES_BUCKET=macropolis-images-dev
ENV GCP_STORAGE_AUDIO_PREVIEWS_BUCKET=macropolis-audio-preview-dev
ENV STRIPE_PUBLISHABLE_KEY=pk_test_tJtcQqBrRirhhiwzIAr1brzT000LqQs92t

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . /app

EXPOSE 8080

RUN npm run build

CMD [ "npm", "run", "start" ]
