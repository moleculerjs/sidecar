FROM ubuntu:20.04

WORKDIR /sidecar

ENV NODE_ENV=production

COPY dist/moleculer-sidecar-linux ./moleculer-sidecar
RUN chmod +x ./moleculer-sidecar

EXPOSE 5103

ENTRYPOINT ["/sidecar/moleculer-sidecar"]
