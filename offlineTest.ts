Deno.serve(async (request) => {
  const url = new URL(request.url);
  console.log(url.pathname);
  if (url.pathname === "/serviceWorker") {
    return new Response(
      (
        await (
          await fetch(new URL("./serviceWorker.js", import.meta.url))
        ).text()
      ).replace("$$VERSION$$", new Date().toISOString()),
      {
        headers: {
          "content-type": "text/javascript",
        },
      }
    );
  }
  if (url.pathname === "/script") {
    return new Response(undefined, { status: 404 });
  }
  return new Response(
    `<!doctype html>
<html>
  <head>
  <meta charset="utf-8">
  <script type=module>
const main = async () => {
   const r = await navigator.serviceWorker.register("/serviceWorker");
   console.log("登録完了!?", r);
};

main();  
</script>
  </head>
  <body>content test ${new Date().toISOString()}</body>
</html>
`,
    { headers: { "content-type": "text/html; charset=utf8" } }
  );
});
