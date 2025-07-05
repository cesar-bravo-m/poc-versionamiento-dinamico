export async function loadRemoteModule({ url, scope, module }) {
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
    // await new Promise((resolve, reject) => {
    //   const script = document.createElement('script');
    //   script.src = url.replace('remoteEntry.js', 'src_Button_jsx.js');
    //   script.type = 'text/javascript';
    //   script.async = true;
    //   script.onload = resolve;
    //   script.onerror = reject;
    //   document.head.appendChild(script);
    // });
    // await new Promise((resolve, reject) => {
    //   const script = document.createElement('script');
    //   script.src = url.replace('remoteEntry.js', 'vendors-node_modules_pnpm_react_18_3_1_node_modules_react_index_js.js');
    //   script.type = 'text/javascript';
    //   script.async = true;
    //   script.onload = resolve;
    //   script.onerror = reject;
    //   document.head.appendChild(script);
    // });
    await window[scope].init(__webpack_share_scopes__.default);
  }

  const factory = await window[scope].get(module);
  return factory().default;
}
