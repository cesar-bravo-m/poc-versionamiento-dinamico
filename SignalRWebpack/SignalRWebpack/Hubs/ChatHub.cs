using Microsoft.AspNetCore.SignalR;

namespace SignalRWebpack.Hubs
{
    public class ChatHub : Hub
    {
        // This hub is now only used for broadcasting version updates
        // The actual version updates are handled via HTTP endpoint
    }
}
