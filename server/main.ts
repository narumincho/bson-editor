import dist from "./dist.json" assert { type: "json" };

Deno.serve((request) => {
  console.log(request.method, request.url);
  const url = new URL(request.url);

  switch (url.pathname) {
    case "/":
      return new Response(
        `<!doctype html>
<html>

<head>
    <meta charset="UTF-8">
    <title>Bson Editor</title>
    <script type="module" src="/${dist.scriptHash}"></script>
    <style>
        :root {
          color-scheme: dark;
        }
    </style>
</head>
<body>
    <div id="loading">Bson Editor loading</div>
</body>

</html>
`,
        {
          headers: {
            "content-type": "text/html",
            "cache-control": "public, max-age=10",
          },
        }
      );
    case `/${dist.scriptHash}`:
      return new Response(dist.scriptContent, {
        headers: {
          "content-type": "text/javascript",
          "cache-control": "public, max-age=604800, immutable",
        },
      });
  }

  return new Response("not found", { status: 404 });
});
