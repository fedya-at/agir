using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Entities
{
    public class InvoicePayment : BaseEntity
    {
        public Guid InvoiceId { get; private set; }
        public decimal Amount { get; private set; }
        public DateTime PaymentDate { get; private set; }
        public string PaymentMethod { get; private set; }
        public string Reference { get; private set; }

        // Navigation properties
        public Invoice Invoice { get; private set; }

        // For EF Core
        protected InvoicePayment() : base() { }

        public InvoicePayment(Guid invoiceId, decimal amount, DateTime paymentDate, string paymentMethod, string reference = null) : base()
        {
            if (amount <= 0)
                throw new ArgumentException("Payment amount must be greater than zero", nameof(amount));

            InvoiceId = invoiceId;
            Amount = amount;
            PaymentDate = paymentDate;
            PaymentMethod = paymentMethod ?? throw new ArgumentNullException(nameof(paymentMethod));
            Reference = reference;
        }

        public void UpdateAmount(decimal amount)
        {
            if (amount <= 0)
                throw new ArgumentException("Payment amount must be greater than zero", nameof(amount));

            Amount = amount;
            UpdateModifiedDate();
        }

        public void UpdatePaymentMethod(string paymentMethod)
        {
            PaymentMethod = paymentMethod ?? throw new ArgumentNullException(nameof(paymentMethod));
            UpdateModifiedDate();
        }

        public void UpdateReference(string reference)
        {
            Reference = reference;
            UpdateModifiedDate();
        }
    }
}
