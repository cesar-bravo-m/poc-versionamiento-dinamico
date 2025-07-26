onmessage = async (e) => {
    postMessage('Web worker procesando mensaje')
    const opfsRoot = await navigator.storage.getDirectory();
    const file = await opfsRoot.getFileHandle("file.txt", { create: true });
    const accessHandle = await file.createSyncAccessHandle();
    const textEncoder = new TextEncoder();
    const textDecoder = new TextDecoder();
    let size;
    size = accessHandle.getSize();
    const content = textEncoder.encode("Texto");
    accessHandle.write(content, { at: size });
    accessHandle.flush();
    size = accessHandle.getSize();
    const moreContent = textEncoder.encode("Más texto");
    accessHandle.write(moreContent, { at: size });
    accessHandle.flush();
    size = accessHandle.getSize();
    const dataView = new DataView(new ArrayBuffer(size));
    accessHandle.read(dataView, { at: 0 });
    console.log(textDecoder.decode(dataView))
    accessHandle.read(dataView, { at: 9 });
    console.log(textDecoder.decode(dataView))
    accessHandle.truncate(4);
}