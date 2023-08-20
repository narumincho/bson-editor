# bson-editor

run vscodeExtension build script

```sh
deno run --check -A ./vscodeExtension/build.ts
```

run server build script

```sh
deno run --check -A ./server/build.ts
```

run server

```sh
deno run --check --watch -A ./server/main.ts
```

run example bson file generator

```sh
deno run --check --allow-write=./example/ ./example/generate.ts
```
