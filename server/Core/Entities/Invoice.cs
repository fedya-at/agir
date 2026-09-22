using Domain.Enums;
using Domain.Exceptions;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Entities
{
    public class Invoice : BaseEntity
    {
        private static decimal _globalLaborCost = 0m;

        public static decimal GlobalLaborCost
        {
            get => _globalLaborCost;
            set
            {
                if (value < 0)
                    throw new ArgumentException("Global labor cost cannot be negative", nameof(value));
                _globalLaborCost = value;
            }
        }

        public Guid InterventionId { get; private set; }
        public string InvoiceNumber { get; private set; }
        public DateTime IssueDate { get; private set; }
        public DateTime DueDate { get; private set; }
        public decimal LaborCost { get; private set; }
        public decimal TotalPartsCost { get; private set; }
        public decimal TotalAmount { get; private set; }
        public InvoiceStatus Status { get; private set; }

        // Navigation properties
        public Intervention Intervention { get; private set; }

        // For EF Core
        protected Invoice() : base() { }

        public Invoice(Guid interventionId, string invoiceNumber, DateTime issueDate, DateTime dueDate, decimal? laborCost, decimal totalPartsCost) : base()
        {
            LaborCost = laborCost ?? GlobalLaborCost;

            if (laborCost < 0)
                throw new ArgumentException("Labor cost cannot be negative", nameof(laborCost));

            if (totalPartsCost < 0)
                throw new ArgumentException("Total parts cost cannot be negative", nameof(totalPartsCost));

            if (dueDate < issueDate)
                throw new ArgumentException("Due date cannot be earlier than issue date", nameof(dueDate));

            InterventionId = interventionId;
            InvoiceNumber = invoiceNumber ?? throw new ArgumentNullException(nameof(invoiceNumber));
            IssueDate = issueDate;
            DueDate = dueDate;
            TotalPartsCost = totalPartsCost;
            TotalAmount = LaborCost + totalPartsCost;
            Status = InvoiceStatus.Draft;
        }

        // In Invoice.cs - modify UpdateCosts method
        public void UpdateCosts(decimal laborCost, decimal totalPartsCost)
        {
            if (Status != InvoiceStatus.Draft)
                throw new InvalidOperationException("Can only update costs in Draft status");

            if (laborCost < 0)
                throw new ArgumentException("Labor cost cannot be negative", nameof(laborCost));

            if (totalPartsCost < 0)
                throw new ArgumentException("Total parts cost cannot be negative", nameof(totalPartsCost));

            LaborCost = laborCost;
            TotalPartsCost = totalPartsCost;
            TotalAmount = laborCost + totalPartsCost;
            UpdateModifiedDate();
        }

        public void UpdateDueDate(DateTime dueDate)
        {
            if (dueDate < IssueDate)
                throw new ArgumentException("Due date cannot be earlier than issue date", nameof(dueDate));

            DueDate = dueDate;
            UpdateModifiedDate();
        }

        public void IssueInvoice()
        {
            if (Status != InvoiceStatus.Draft)
                throw new InvalidInvoiceStatusChangeException(Status, InvoiceStatus.Issued);

            Status = InvoiceStatus.Issued;
            UpdateModifiedDate();
        }

        public void MarkAsPaid()
        {
            if (Status != InvoiceStatus.Issued)
                throw new InvalidInvoiceStatusChangeException(Status, InvoiceStatus.Paid);

            Status = InvoiceStatus.Paid;
            UpdateModifiedDate();
        }

        public void CancelInvoice()
        {
            if (Status == InvoiceStatus.Paid)
                throw new InvalidInvoiceStatusChangeException(Status, InvoiceStatus.Cancelled);

            Status = InvoiceStatus.Cancelled;
            UpdateModifiedDate();
        }
        public void UpdateCosts(decimal laborCost, decimal totalPartsCost, bool updateGlobal = false)
        {
            if (Status != InvoiceStatus.Draft)
                throw new InvalidOperationException("Can only update costs in Draft status");

            if (laborCost < 0)
                throw new ArgumentException("Labor cost cannot be negative", nameof(laborCost));

            if (totalPartsCost < 0)
                throw new ArgumentException("Total parts cost cannot be negative", nameof(totalPartsCost));

            LaborCost = laborCost;
            TotalPartsCost = totalPartsCost;
            TotalAmount = laborCost + totalPartsCost;

            if (updateGlobal)
            {
                GlobalLaborCost = laborCost;
            }

            UpdateModifiedDate();
        }
        public static void SetGlobalLaborCost(decimal laborCost)
        {
            if (laborCost < 0)
                throw new ArgumentException("Labor cost cannot be negative", nameof(laborCost));

            GlobalLaborCost = laborCost;
        }
    }
}
