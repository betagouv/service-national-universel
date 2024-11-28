# Setup local infrastructure

## Create infrastructure

### 1 - Get a staging database dump

The following command makes a dump of the staging database into the **dump** directory :

```bash
./pull_staging.sh
```

### 2 - Start the infrastructure containers

```bash
docker compose up -d
```

## Stop & start containers

```bash
docker compose stop
docker compose start
```

## Remove infrastructure

```bash
docker compose down
```

## Use an existing dump in another directory

```bash
DUMP_DIRECTORY=<my-dump-directory> docker compose up -d
```
