FROM dockerfile/nodejs

# Install npm
RUN mkdir -p /src

# Add files.
WORKDIR /src
ADD . /src
RUN cd /src && npm install

# Set environment variables.
ENV NODE_ENV production
ENV PORT 2368

# Define default command.
CMD ["node", "/src/source/main.js"]

# Expose ports.
EXPOSE 2368
