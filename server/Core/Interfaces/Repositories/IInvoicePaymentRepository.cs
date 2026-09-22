using Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Interfaces.Repositories
{
    public interface IInvoicePaymentRepository
    {
        Task<IEnumerable<InvoicePayment>> GetAllAsync();
        Task<InvoicePayment> GetByIdAsync(Guid id);
        Task<IEnumerable<InvoicePayment>> GetByInvoiceIdAsync(Guid invoiceId);
        Task<IEnumerable<InvoicePayment>> GetByDateRangeAsync(DateTime startDate, DateTime endDate);
        Task<bool> ExistsAsync(Guid id);
        Task AddAsync(InvoicePayment payment);
        Task UpdateAsync(InvoicePayment payment);
        Task DeleteAsync(Guid id);
    }
}
