using Domain.Entities;
using Domain.Enums;
using System;

namespace Application.DTOs
{
    public class AlertDto : BaseDto
    {
        public Guid PartId { get; set; }
        public string PartName { get; set; }
        public int CurrentStock { get; set; }
        public int Threshold { get; set; }
        public string Message { get; set; }
        public AlertStatus Status { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? SentAt { get; set; }
        public DateTime? AcknowledgedAt { get; set; }
        public bool IsEscalated { get; set; }
    }
}