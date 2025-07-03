export async function loadRemoteModule({ url, scope, module }) {
  console.log("### loadRemoteModule url", url);
  console.log("### loadRemoteModule scope", scope);
  console.log("### loadRemoteModule module", module);
  await __webpack_init_sharing__('default');

  if (!window[scope]) {
    await new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = url;
      script.type = 'text/javascript';
      script.async = true;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
    await window[scope].init(__webpack_share_scopes__.default);
  }

  const factory = await window[scope].get(module);
  return factory().default;
}
