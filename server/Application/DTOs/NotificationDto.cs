using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.DTOs
{
    public class NotificationDto : BaseDto
    {
        // Type of notification (e.g., "InterventionAssigned", "StatusChanged", "NewIntervention")
        public string Type { get; set; }

        // Message content
        public string Message { get; set; }

        // Related entity ID (e.g., InterventionId) - changed from int? to string
        public string RelatedEntityId { get; set; }

        // Additional data in JSON format (can be deserialized on client side)
        public string Data { get; set; }

        // Whether the notification has been read
        public bool IsRead { get; set; }

        // Timestamp when the notification was created
        public new DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // User ID who should receive this notification
        public string UserId { get; set; }
    }
}