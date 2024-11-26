# Vue 3 + TypeScript + Vite + Express

**Load Monitoring Web Application**

- communicates with a local back-end service to retrieve CPU load average information from your computer 
- retrieves CPU load information every 10 seconds
- maintains a 10 minute window of historical CPU load information
- alerts the user to high CPU load
- alerts the user when CPU load has recovered

### Start application

```bash
# Install dependencies in root, frontend, backend directories
$ npm install

# Run in development mode
$ npm run dev

# Run production build
$ npm run start
```

### Formatting, tests

```bash
# Run formatting
$ npm run format

# Run frontend tests
cd frontend
$ npm run test
```
