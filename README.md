# Build

```console
dotnet build
```

# Run

First, you need to deploy the postgresql database:
```console
docker run --name postgres -e POSTGRES_PASSWORD=pwd1248 -p 5432:5432 -d postgres
```
then
```console
dotnet run
```
