using Microsoft.AspNetCore.SignalR;
using System.Text.RegularExpressions;

namespace Hubs
{
    public class InterventionHub : Hub
    {
        // Send notification about intervention status change
        public async Task SendInterventionStatusUpdate(string userId, int interventionId, string status)
        {
            await Clients.User(userId).SendAsync("ReceiveInterventionStatusUpdate", interventionId, status);
        }

        // Send notification about new intervention to admins
        public async Task SendNewInterventionNotification(int interventionId, string clientName)
        {
            await Clients.Group("Admins").SendAsync("ReceiveNewIntervention", interventionId, clientName);
        }

        // Send notification about intervention assignment to technician
        public async Task SendInterventionAssignmentNotification(string technicianId, int interventionId, string clientName)
        {
            await Clients.User(technicianId).SendAsync("ReceiveInterventionAssignment", interventionId, clientName);
        }

        // Add user to role-based group when they connect
        public async Task AddToUserGroup(string userRole)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, userRole);
        }

        // Override OnConnectedAsync to handle connection setup
        public override async Task OnConnectedAsync()
        {
            // Get user ID from claims
            var userId = Context.User?.Identity?.Name;
            if (!string.IsNullOrEmpty(userId))
            {
                // Add user to their personal group (for direct messages)
                await Groups.AddToGroupAsync(Context.ConnectionId, userId);
            }

            await base.OnConnectedAsync();
        }

        // Override OnDisconnectedAsync to handle cleanup
        public override async Task OnDisconnectedAsync(System.Exception exception)
        {
            // Get user ID from claims
            var userId = Context.User?.Identity?.Name;
            if (!string.IsNullOrEmpty(userId))
            {
                // Remove user from their personal group
                await Groups.RemoveFromGroupAsync(Context.ConnectionId, userId);
            }

            await base.OnDisconnectedAsync(exception);
        }
    }
}


