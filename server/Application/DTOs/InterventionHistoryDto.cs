using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.DTOs
{
    public class InterventionHistoryDto
    {
        public Guid Id { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public string Status { get; set; } // String representation of the enum
        public string Description { get; set; }
        public string TechnicianName { get; set; }
        public IEnumerable<string> PartsUsed { get; set; } // List of part names/descriptions
    }

}
