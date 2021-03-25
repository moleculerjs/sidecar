FROM crystallang/crystal:1.0.0
WORKDIR /data

RUN apt-get update && \
  apt-get install -y libgconf-2-4 curl libreadline-dev && \
  # Cleanup leftovers
  apt-get clean && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

COPY server.cr shard.yml shard.lock ./
RUN shards install --ignore-crystal-version
RUN crystal build server.cr

CMD ["./server"]
