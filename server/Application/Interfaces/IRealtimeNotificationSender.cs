using Application.DTOs;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Interfaces
{
    public interface IRealtimeNotificationSender
    {
        Task SendNotificationToUserAsync(string userId, NotificationDto notification);
        Task SendNotificationToGroupAsync(string groupName, NotificationDto notification);
        Task SendNotificationToAllAsync(NotificationDto notification);
        Task SendInterventionStatusUpdateAsync(string userId, string interventionId, int status);
        Task SendNewInterventionNotificationAsync(string interventionId, string clientName);
        Task SendInterventionAssignmentAsync(string technicianId, string interventionId, string technicianName);
    }
}
