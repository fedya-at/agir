using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.DTOs
{
    public class InterventionPartDto : BaseDto
    {
        public Guid Id { get; set; }
        public Guid InterventionId { get; set; }
        public Guid PartId { get; set; }
        public string PartName { get; set; }
        public string PartDescription { get; set; }
        public int Quantity { get; set; }
        public decimal UnitPrice { get; set; }
        public decimal TotalPrice { get; set; }
        public PartDto Part { get; set; }

    }
    public class CreateInterventionPartDto
    {
        [Required]
        public Guid PartId { get; set; }

        [Required]
        [Range(1, int.MaxValue)]
        public int Quantity { get; set; }
    }
    public class UpdateInterventionPartDto
    {
        [Required]
        [Range(1, int.MaxValue)]
        public int Quantity { get; set; }
    }
}
