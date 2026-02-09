using Domain.Entities;
using Domain.Interfaces.Repositories;
using Infrastructure.Persistence.Context;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Infrastructure.Persistence.Repositories
{
    public class InvoicePaymentRepository : IInvoicePaymentRepository
    {
        private readonly ApplicationDbContext _context;

        public InvoicePaymentRepository(ApplicationDbContext context)
        {
            _context = context ?? throw new ArgumentNullException(nameof(context));
        }

        public async Task<IEnumerable<InvoicePayment>> GetAllAsync()
        {
            return await _context.InvoicePayments
                .Include(ip => ip.Invoice)
                .ToListAsync();
        }

        public async Task<InvoicePayment> GetByIdAsync(Guid id)
        {
            return await _context.InvoicePayments
                .Include(ip => ip.Invoice)
                .FirstOrDefaultAsync(ip => ip.Id == id);
        }

        public async Task<IEnumerable<InvoicePayment>> GetByInvoiceIdAsync(Guid invoiceId)
        {
            return await _context.InvoicePayments
                .Where(ip => ip.InvoiceId == invoiceId)
                .ToListAsync();
        }

        public async Task<IEnumerable<InvoicePayment>> GetByDateRangeAsync(DateTime startDate, DateTime endDate)
        {
            return await _context.InvoicePayments
                .Include(ip => ip.Invoice)
                .Where(ip => ip.PaymentDate >= startDate && ip.PaymentDate <= endDate)
                .ToListAsync();
        }

        public async Task<bool> ExistsAsync(Guid id)
        {
            return await _context.InvoicePayments.AnyAsync(ip => ip.Id == id);
        }

        public async Task AddAsync(InvoicePayment payment)
        {
            await _context.InvoicePayments.AddAsync(payment);
        }

        public Task UpdateAsync(InvoicePayment payment)
        {
            _context.Entry(payment).State = EntityState.Modified;
            return Task.CompletedTask;
        }

        public Task DeleteAsync(Guid id)
        {
            var payment = _context.InvoicePayments.Find(id);
            if (payment != null)
            {
                _context.InvoicePayments.Remove(payment);
            }
            return Task.CompletedTask;
        }
    }
}
