import dist from "./dist.json" with { type: "json" };

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
    <title>nBson Editor</title>
    <script type="module" src="/${dist.scriptHash}"></script>
    <style>
        :root {
          color-scheme: dark;
        }

        html {
          height: 100%;
        }

        body {
          margin: 0;
          height: 100%;
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
        },
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
