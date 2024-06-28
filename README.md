# bson-editor

_under development_

- [bson spec](https://bsonspec.org/)

## start web server

```sh
deno run -A https://github.com/narumincho/bson-editor/blob/main/server/main.ts
```

## Development

### run vscodeExtension build script

```sh
deno run --check -A ./vscodeExtension/build.ts
```

### run client script build script

```sh
deno run --check -A ./server/build.ts
```

### run server

```sh
deno run --check --watch -A ./server/main.ts
```

### run example bson file generator

```sh
deno run --check --allow-write=./example/ ./example/generate.ts
```
