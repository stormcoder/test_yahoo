FROM mcr.microsoft.com/playwright:v1.52.0-noble

WORKDIR /app

# Create non-root user
RUN useradd -m -s /bin/bash developer

# Create all directories first
RUN mkdir -p /home/developer/.npm && \
    mkdir -p /home/developer/.npm-global && \
    mkdir -p /home/developer/.npm/_logs && \
    mkdir -p /usr/local/lib/node_modules && \
    mkdir -p /usr/local/share/man/man7 && \
    mkdir -p /app/node_modules && \
    mkdir -p /app/dist && \
    mkdir -p /app/dist/pages && \
    mkdir -p /app/dist/steps && \
    mkdir -p /app/dist/support && \
    mkdir -p /app/reports

# Update npm and install global packages as root
RUN npm install -g npm@9.5.1 && \
    npm install -g typescript @playwright/test

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install express @types/express && \
    npm install && npm install -g npm@11.3.0

# Copy source files
COPY . .

# Set all permissions
RUN chmod -R 777 /app && \
    chown -R developer:developer /home/developer && \
    chown -R developer:developer /usr/local/lib/node_modules && \
    chown -R developer:developer /usr/local/bin && \
    chown -R developer:developer /usr/local/share && \
    chown -R developer:developer /app

# Create and configure startup script
RUN echo '#!/bin/bash\n\
trap "kill 0" EXIT\n\
npm run build && \
if [ $? -eq 0 ]; then\n\
  node dist/server.js & \n\
  echo "API Server started on port 3000"\n\
  echo "Container ready for manual test execution"\n\
  tail -f /dev/null\n\  # Keep container running without wait
else\n\
  echo "Build failed"\n\
fi' > /app/startup.sh

# Switch to developer user
USER developer
ENV PORT=3000

# Configure npm for developer user
RUN npm config set prefix /home/developer/.npm-global && \
    npm config set cache /home/developer/.npm && \
    npm config set package-lock false && \
    echo 'export PATH=/home/developer/.npm-global/bin:$PATH' >> /home/developer/.bashrc

# Add common aliases
RUN echo 'alias dir="ls -lha"' >> /home/developer/.bashrc && \
    echo 'alias ll="ls -la"' >> /home/developer/.bashrc && \
    echo 'alias cls="clear"' >> /home/developer/.bashrc && \
    echo 'alias ..="cd .."' >> /home/developer/.bashrc && \
    echo 'alias ...="cd ../.."' >> /home/developer/.bashrc && \
    echo 'alias gs="git status"' >> /home/developer/.bashrc && \
    echo 'alias gl="git log"' >> /home/developer/.bashrc && \
    echo 'alias gp="git pull"' >> /home/developer/.bashrc

EXPOSE ${PORT}
ENTRYPOINT ["/app/startup.sh"]