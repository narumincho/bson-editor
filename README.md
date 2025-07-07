# bson-editor

_under development_

## 参考

- [bson spec](https://bsonspec.org/)
- https://www.mongodb.com/resources/basics/json-and-bson

## Development

### run vscodeExtension build script

```sh
deno run --check -A ./vscodeExtension/build.ts
```

### run web build script

```sh
deno run --check -A ./web/build.tsx
```

### run example bson file generator

```sh
deno run --check --allow-write=./example/ ./example/generate.ts
```
