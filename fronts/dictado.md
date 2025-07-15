# Documentación Técnica del Mecanismo de Dictado

Este proyecto incluye una funcionalidad de dictado de voz que permite transcribir texto desde un celular y enviarlo a la aplicación principal mediante SignalR. A continuación se describe su funcionamiento y los archivos implicados.

## 1. Flujo General

- El usuario abre la página de dictado en el teléfono, posiblemente escaneando un código QR.
- La página utiliza la Web Speech API (SpeechRecognition) para convertir la voz en texto.
- Cada vez que se obtiene un texto reconocido, se envía al servidor a través del método `SendDictation`.
- El servidor (SignalR) reenvía ese texto a todos los clientes suscritos mediante el evento `ReceiveDictation`.
- El cliente principal (host) recibe el texto y lo muestra en un cuadro de diálogo.

## 2. Frontend para el teléfono

**Archivo:** `version-backend/SignalRWebpack/wwwroot/dictation.html`

```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/microsoft-signalr/8.0.7/signalr.min.js"></script>
<script>
  const connection = new signalR.HubConnectionBuilder().withUrl('/hub').build();
  connection.start().catch(err => console.error(err));
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognizer = new SpeechRecognition();
  recognizer.lang = 'es-CL';
  recognizer.continuous = true;
  recognizer.interimResults = false;
  recognizer.onresult = ev => {
    const txt = Array.from(ev.results).map(r => r[0].transcript).join(' ');
    document.getElementById('text').value = txt;
    connection.invoke('SendDictation', txt);
  };
</script>
```

Este código establece una conexión SignalR con el servidor (`/hub`), inicia el reconocimiento de voz y envía los resultados al servidor mediante `SendDictation`.

## 3. Backend (SignalR)

**Archivo:** `version-backend/SignalRWebpack/Hubs/ChatHub.cs`

```csharp
public class ChatHub : Hub
{
    public async Task SendDictation(string text)
    {
        await Clients.All.SendAsync("ReceiveDictation", text);
    }
}
```

El servidor implementa el método `SendDictation` que recibe el texto dictado y lo reenvía a todos los clientes a través del evento `ReceiveDictation`.

## 4. Cliente principal (host)

**Archivo:** `fronts/host/src/App.jsx`

```jsx
const [dictationText, setDictationText] = useState('');
const [showDictationModal, setShowDictationModal] = useState(false);

useEffect(() => {
  const connection = new signalR.HubConnectionBuilder()
    .withUrl('http://localhost:5018/hub')
    .build();

  connection.on('ReceiveDictation', (text) => {
    setDictationText(text);
  });

  connection.start().catch(err => console.error(err));
}, []);

const mobileUrl = `http://192.168.0.8:5018/dictation.html`;

{showDictationModal && (
  <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex',
                alignItems: 'center', justifyContent: 'center', zIndex: 2000 }}>
    <div style={{ background: 'white', padding: 20, borderRadius: 8, width: '300px' }}>
      <h3>Dictado desde teléfono</h3>
      <p>Abre <a href={mobileUrl} target="_blank" rel="noreferrer">{mobileUrl}</a> en tu teléfono.</p>
      <textarea readOnly value={dictationText} style={{ width: '100%', height: '80px' }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10 }}>
        <button onClick={() => navigator.clipboard.writeText(dictationText)}>
          📋 Copiar
        </button>
        <button onClick={() => setShowDictationModal(false)}>Cerrar</button>
      </div>
    </div>
  </div>
)}
```

Aquí se ofrece un botón para copiar el texto y se permite cerrar el diálogo.

## 5. Resumen del Mecanismo

- Captura de voz en el celular mediante la API `SpeechRecognition`.
- Envío de texto en tiempo real mediante `connection.invoke('SendDictation', txt)`.
- Reenvío del servidor a los clientes con `ReceiveDictation`.

```
