using Domain.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.DTOs
{
    public class HistoryDto
    {
        public Guid Id { get; set; }
        public DateTime Timestamp { get; set; }
        public string Action { get; set; }
        public string EntityName { get; set; }
        public Guid EntityId { get; set; }
        public string Changes { get; set; }
        public Guid UserId { get; set; }
    }
}
