# Trade Portfolio

### Instructions to run this app

Setup mongodb database
```bash
node scripts/setupdb.js --connection=<mongodb connection string> --database=<database name>
```

Build the docker image
```bash
docker build -t <name:tag> .
```

Run the image
```bash
docker run -p <port>:3000 -e MONGO_CONNECTION_STRING=<mongodb connection string> -e MONGO_DB_NAME=<database name> -d <name:tag>
```