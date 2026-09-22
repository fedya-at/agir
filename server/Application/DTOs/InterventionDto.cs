using Domain.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.DTOs
{
    public class InterventionDto : BaseDto
    {
        public string Description { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public InterventionStatus Status { get; set; }
        public Guid ClientId { get; set; }
        public Guid? TechnicianId { get; set; }

        // Navigation properties
        public ClientDto Client { get; set; }
        public TechnicianDto Technician { get; set; }
        public InvoiceDto Invoice { get; set; }
        public ICollection<InterventionPartDto> InterventionParts { get; set; }
    }

    /// <summary>
    /// DTO for creating a new Intervention
    /// </summary>
    public class CreateInterventionDto
    {
        public string Description { get; set; }
        public DateTime StartDate { get; set; }
        public Guid ClientId { get; set; }
        public Guid? TechnicianId { get; set; }
    }

    /// <summary>
    /// DTO for updating an existing Intervention
    /// </summary>
    public class UpdateInterventionDto
    {
        public string Description { get; set; }
        public Guid? TechnicianId { get; set; }
    }

    /// <summary>
    /// DTO for adding a part to an intervention
    /// </summary>
    public class AddInterventionPartDto
    {
        public Guid PartId { get; set; }
        public int Quantity { get; set; }
        public decimal UnitPrice { get; set; }
    }
}
