using Domain.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.DTOs
{
    public class InvoiceDto : BaseDto
    {
        public Guid InterventionId { get; set; }
        public string InvoiceNumber { get; set; }
        public DateTime IssueDate { get; set; }
        public DateTime DueDate { get; set; }
        public decimal LaborCost { get; set; }
        public decimal TotalPartsCost { get; set; }
        public decimal TotalAmount { get; set; }
        public InvoiceStatus Status { get; set; }

        // Navigation properties
        public InterventionDto Intervention { get; set; }
        public ICollection<InvoicePaymentDto> Payments { get; set; }
    }

    /// <summary>
    /// DTO for creating a new Invoice
    /// </summary>
    public class CreateInvoiceDto
    {
        public Guid InterventionId { get; set; }
        public string InvoiceNumber { get; set; }
        public DateTime IssueDate { get; set; }
        public DateTime DueDate { get; set; }
        public decimal LaborCost { get; set; }
        public decimal TotalPartsCost { get; set; }
    }

    /// <summary>
    /// DTO for updating an existing Invoice
    /// </summary>
    public class UpdateInvoiceDto
    {
        public DateTime DueDate { get; set; }
        public decimal LaborCost { get; set; }
        public decimal TotalPartsCost { get; set; }
    }
    public class UpdateGlobalLaborCostDto
    {
        public decimal LaborCost { get; set; }
    }
}
