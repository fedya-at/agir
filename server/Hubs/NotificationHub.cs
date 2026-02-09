using Microsoft.AspNetCore.SignalR;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace Hubs
{
    public class NotificationHub : Hub
    {
        public async Task SendNotification(string user, string message)
        {
            await Clients.User(user).SendAsync("ReceiveNotification", message);
        }

        // Send notification to a specific group (e.g., admins, technicians)
        public async Task SendGroupNotification(string groupName, string message)
        {
            await Clients.Group(groupName).SendAsync("ReceiveNotification", message);
        }

        // Send notification to all connected clients
        public async Task SendAllNotification(string message)
        {
            await Clients.All.SendAsync("ReceiveNotification", message);
        }

        // Add a user to a group (e.g., when a user logs in)
        public async Task AddToGroup(string groupName)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, groupName);
        }

        // Remove a user from a group (e.g., when a user logs out)
        public async Task RemoveFromGroup(string groupName)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, groupName);
        }
    }
}



