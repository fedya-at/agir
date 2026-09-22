using Domain.Entities;
using Domain.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Interfaces.Repositories
{
    public interface IInvoiceRepository
    {
        Task<IEnumerable<Invoice>> GetAllAsync();
        Task<Invoice> GetByIdAsync(Guid id);
        Task<Invoice> GetByInvoiceNumberAsync(string invoiceNumber);
        Task<Invoice> GetByInterventionIdAsync(Guid interventionId);
        Task<IEnumerable<Invoice>> GetByStatusAsync(InvoiceStatus status);
        Task<IEnumerable<Invoice>> GetByDateRangeAsync(DateTime startDate, DateTime endDate);
        Task<IEnumerable<Invoice>> GetOverdueAsync();
        Task<bool> ExistsAsync(Guid id);
        Task<bool> InvoiceNumberExistsAsync(string invoiceNumber);
        Task AddAsync(Invoice invoice);
        Task UpdateAsync(Invoice invoice);
        Task DeleteAsync(Guid id);
    }
}
