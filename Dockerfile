# /playwright-tests/Dockerfile
FROM node:20-slim

# Install required dependencies
RUN apt-get update && apt-get install -y \
    git \
    curl \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Install Playwright dependencies
RUN npx playwright install-deps

WORKDIR /app

# Create a non-root user and set proper permissions
RUN useradd -m -s /bin/bash developer && \
    mkdir -p /home/developer/.npm && \
    mkdir -p /home/developer/.npm-global && \
    mkdir -p /home/developer/.npm/_logs && \
    chown -R developer:developer /home/developer && \
    chown -R developer:developer /usr/local/lib/node_modules && \
    chown -R developer:developer /usr/local/bin && \
    mkdir -p /usr/local/share/man/man7 && \
    chown -R developer:developer /usr/local/share/man && \
    chown -R developer:developer /usr/local/share && \
    mkdir -p /app/node_modules && \
    chown -R developer:developer /app

USER developer

# Configure npm
RUN npm config set prefix /home/developer/.npm-global && \
    npm config set cache /home/developer/.npm && \
    npm config set package-lock false && \
    echo 'export PATH=/home/developer/.npm-global/bin:$PATH' >> /home/developer/.bashrc

# Add common aliases to .bashrc
RUN echo 'alias dir="ls -lha"' >> /home/developer/.bashrc && \
    echo 'alias ll="ls -la"' >> /home/developer/.bashrc && \
    echo 'alias cls="clear"' >> /home/developer/.bashrc && \
    echo 'alias ..="cd .."' >> /home/developer/.bashrc && \
    echo 'alias ...="cd ../.."' >> /home/developer/.bashrc && \
    echo 'alias gs="git status"' >> /home/developer/.bashrc && \
    echo 'alias gl="git log"' >> /home/developer/.bashrc && \
    echo 'alias gp="git pull"' >> /home/developer/.bashrc

# Update npm and install global packages
RUN npm install -g npm@11.3.0 && \
    npm install -g @playwright/test

# Keep container running
CMD ["bash"]
