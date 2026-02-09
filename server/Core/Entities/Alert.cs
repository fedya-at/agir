using Domain.Enums;
using System;
using System.ComponentModel.DataAnnotations;

namespace Domain.Entities
{
   
    public class Alert : BaseEntity
    {
        public Guid PartId { get; set; }
        public string PartName { get; set; } // Assuming PartName is needed for notifications
        public int CurrentStock { get; set; }
        public int Threshold { get; set; }
        public string Message { get; set; }
        public AlertStatus Status { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? SentAt { get; set; }
        public DateTime? AcknowledgedAt { get; set; }
        public bool IsEscalated { get; set; }
        public string RecipientEmail { get; set; }
        public string RecipientPhone { get; set; }

        public Alert()
        {
            CreatedAt = DateTime.UtcNow;
            Status = AlertStatus.Pending;
            IsEscalated = false;
        }

        public void MarkSent()
        {
            Status = AlertStatus.Sent;
            SentAt = DateTime.UtcNow;
        }

        public void MarkAcknowledged()
        {
            Status = AlertStatus.Acknowledged;
            AcknowledgedAt = DateTime.UtcNow;
        }

        public void MarkEscalated()
        {
            IsEscalated = true;
            // Optionally change status or add escalation specific logic
        }
    }
}