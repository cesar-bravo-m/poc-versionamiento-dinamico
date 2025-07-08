using Microsoft.AspNetCore.SignalR;

namespace SignalRWebpack.Hubs
{
    public class ChatHub : Hub
    {
        public async Task SendDictation(string text)
        {
            await Clients.All.SendAsync("ReceiveDictation", text);
        }
    }
}
