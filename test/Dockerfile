FROM grafana/k6:latest
COPY . /app
WORKDIR /app
CMD ["k6", "run", "load_test.js"]


#docker build -t k6-load-test .
#docker run --network=sharednetwork k6-load-test

