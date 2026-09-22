using Application.DTOs;
using Domain.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Interfaces
{
    public interface IInvoiceService
    {
        Task<IEnumerable<InvoiceDto>> GetAllInvoicesAsync();
        Task<InvoiceDto> GetInvoiceByIdAsync(Guid id);
        Task<InvoiceDto> GetInvoiceByInvoiceNumberAsync(string invoiceNumber);
        Task<InvoiceDto> GetInvoiceByInterventionIdAsync(Guid interventionId);
        Task<IEnumerable<InvoiceDto>> GetInvoicesByStatusAsync(InvoiceStatus status);
        Task<IEnumerable<InvoiceDto>> GetInvoicesByDateRangeAsync(DateTime startDate, DateTime endDate);
        Task<IEnumerable<InvoiceDto>> GetOverdueInvoicesAsync();
        Task<InvoiceDto> CreateInvoiceAsync(CreateInvoiceDto invoiceDto);
        Task<InvoiceDto> UpdateInvoiceAsync(Guid id, UpdateInvoiceDto invoiceDto);
        Task DeleteInvoiceAsync(Guid id);
        Task<InvoiceDto> IssueInvoiceAsync(Guid id);
        Task<InvoiceDto> MarkInvoiceAsPaidAsync(Guid id);
        Task<InvoiceDto> CancelInvoiceAsync(Guid id);
        Task<InvoiceDto> AddPaymentAsync(Guid invoiceId, CreateInvoicePaymentDto paymentDto);
        Task<IEnumerable<InvoicePaymentDto>> GetInvoicePaymentsAsync(Guid invoiceId);
        Task<byte[]> GenerateInvoicePdfAsync(Guid id);
        Task<InvoiceDto> GenerateInvoiceForInterventionAsync(Guid interventionId);
        Task<decimal> GetGlobalLaborCostAsync();
        Task SetGlobalLaborCostAsync(decimal laborCost);
    }
}
