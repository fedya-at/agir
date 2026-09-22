using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.DTOs
{
    public class InvoicePaymentDto : BaseDto
    {
        public Guid InvoiceId { get; set; }
        public Decimal Amount { get; set; }
        public DateTime PaymentDate { get; set; }
        public string PaymentMethod { get; set; }
        public string Reference { get; set; }
    }

    /// <summary>
    /// DTO for creating a new InvoicePayment
    /// </summary>
    public class CreateInvoicePaymentDto
    {
        public Decimal Amount { get; set; }
        public DateTime PaymentDate { get; set; }
        public string PaymentMethod { get; set; }
        public string Reference { get; set; }
    }
}
