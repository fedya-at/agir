using Domain.Interfaces.Repositories;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace Application.Services
{
    public interface IInvoiceNumberGenerator
    {
        Task<string> GenerateNextInvoiceNumberAsync();
    }

    public class InvoiceNumberGenerator : IInvoiceNumberGenerator
    {
        private readonly IUnitOfWork _unitOfWork;

        public InvoiceNumberGenerator(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<string> GenerateNextInvoiceNumberAsync()
        {
            // Get all invoices ordered by issue date descending
            var invoices = await _unitOfWork.Invoices.GetAllAsync();
            var lastInvoice = invoices.OrderByDescending(i => i.IssueDate).FirstOrDefault();

            if (lastInvoice == null)
            {
                return $"INV-{DateTime.Now.Year}-001";
            }

            var parts = lastInvoice.InvoiceNumber.Split('-');
            if (parts.Length == 3 && int.TryParse(parts[2], out int lastNumber))
            {
                return $"INV-{DateTime.Now.Year}-{(lastNumber + 1).ToString("D3")}";
            }

            return $"INV-{DateTime.Now.Year}-001";
        }
    }
}