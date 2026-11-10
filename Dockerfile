FROM node:22-slim
RUN apt-get update -qq && apt-get install -y -qq curl jq >/dev/null && rm -rf /var/lib/apt/lists/*
RUN useradd -m dev
USER dev
WORKDIR /home/dev
COPY --chown=dev server.js README.md /home/dev/app/
COPY --chown=dev scripts /home/dev/scripts
CMD ["bash", "scripts/test.sh"]
