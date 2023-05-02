FROM --platform=linux/amd64 node:18.15.0

ENV APP_NAME=xpo.space
ENV DOMAIN_NAME=testdomainaaa.xyz
ENV DOMAIN_URL=https://testdomainaaa.xyz
ENV BACKEND_URL=https://api.testdomainaaa.xyz
ENV GCP_STORAGE_URL=https://storage.googleapis.com
ENV GCP_STORAGE_IMAGES_BUCKET=lisenmi-images-test
ENV GCP_STORAGE_AUDIO_PREVIEWS_BUCKET=lisenmi-audio-preview-test
ENV STRIPE_PUBLISHABLE_KEY=pk_test_tJtcQqBrRirhhiwzIAr1brzT000LqQs92t

WORKDIR /app

COPY package*.json ./

RUN npm install
RUN npm run build

COPY . /app

EXPOSE 80

CMD [ "npm", "run", "start" ]
