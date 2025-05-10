FROM mcr.microsoft.com/playwright:v1.52.0-noble

WORKDIR /app

# Create a non-root user and set proper permissions
RUN useradd -m -s /bin/bash developer && \
    mkdir -p /home/developer/.npm && \
    mkdir -p /home/developer/.npm-global && \
    mkdir -p /home/developer/.npm/_logs && \
    mkdir -p /usr/local/lib/node_modules && \
    mkdir -p /usr/local/share/man/man7 && \
    mkdir -p /app/node_modules && \
    mkdir -p /app/dist && \
    mkdir -p /app/reports && \
    chmod 777 /app/reports && \
    chown -R developer:developer /home/developer && \
    chown -R developer:developer /usr/local/lib/node_modules && \
    chown -R developer:developer /usr/local/bin && \
    chown -R developer:developer /usr/local/share && \
    chown -R developer:developer /app && \
    chmod 777 /app/dist

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
RUN npm install -g npm@9.5.1 && \
    npm install -g typescript @playwright/test

# Copy package files
COPY package*.json ./

# Install project dependencies
RUN npm install

# Keep container running
CMD ["bash"]
