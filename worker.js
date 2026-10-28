export default {
  async fetch(request, env, ctx) {
    const upgrade = request.headers.get("Upgrade");
    if (upgrade === "websocket") {
      const pair = new WebSocketPair();
      const [client, server] = Object.values(pair);
      server.accept();
      ctx.waitUntil((async () => {
        try {
          const tcp = await connect({ hostname: "fr1.wssht.to", port: 80 });
          const writer = tcp.writable.getWriter();
          const reader = tcp.readable.getReader();
          server.addEventListener("message", async (e) => {
            await writer.write(typeof e.data === "string" ? new TextEncoder().encode(e.data) : new Uint8Array(e.data));
          });
          server.addEventListener("close", () => { try { writer.close(); } catch {} });
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            server.send(value);
          }
        } catch { server.close(); }
      })());
      return new Response(null, { status: 101, webSocket: client });
    }
    return new Response("OK", { status: 200 });
  }
};
