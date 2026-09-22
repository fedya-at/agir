using Domain.Entities;
using Domain.Enums;
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
    public class InvoiceRepository : IInvoiceRepository
    {
        private readonly ApplicationDbContext _context;

        public InvoiceRepository(ApplicationDbContext context)
        {
            _context = context ?? throw new ArgumentNullException(nameof(context));
        }

        public async Task<IEnumerable<Invoice>> GetAllAsync()
        {
            return await _context.Invoices
                .Include(i => i.Intervention)
                    .ThenInclude(i => i.Client)
                .Include(i => i.Intervention)
                    .ThenInclude(i => i.Technician)
                .ToListAsync();
        }

        public async Task<Invoice> GetByIdAsync(Guid id)
        {
            return await _context.Invoices
                .Include(i => i.Intervention)
                    .ThenInclude(i => i.Client)
                .Include(i => i.Intervention)
                    .ThenInclude(i => i.Technician)
                .FirstOrDefaultAsync(i => i.Id == id);
        }

        public async Task<Invoice> GetByInvoiceNumberAsync(string invoiceNumber)
        {
            return await _context.Invoices
                .Include(i => i.Intervention)
                    .ThenInclude(i => i.Client)
                .Include(i => i.Intervention)
                    .ThenInclude(i => i.Technician)
                .FirstOrDefaultAsync(i => i.InvoiceNumber == invoiceNumber);
        }

        public async Task<Invoice> GetByInterventionIdAsync(Guid interventionId)
        {
            return await _context.Invoices
                .Include(i => i.Intervention)
                    .ThenInclude(i => i.Client)
                .Include(i => i.Intervention)
                    .ThenInclude(i => i.Technician)
                .FirstOrDefaultAsync(i => i.InterventionId == interventionId);
        }

        public async Task<IEnumerable<Invoice>> GetByStatusAsync(InvoiceStatus status)
        {
            return await _context.Invoices
                .Include(i => i.Intervention)
                    .ThenInclude(i => i.Client)
                .Include(i => i.Intervention)
                    .ThenInclude(i => i.Technician)
                .Where(i => i.Status == status)
                .ToListAsync();
        }

        public async Task<IEnumerable<Invoice>> GetByDateRangeAsync(DateTime startDate, DateTime endDate)
        {
            return await _context.Invoices
                .Include(i => i.Intervention)
                    .ThenInclude(i => i.Client)
                .Include(i => i.Intervention)
                    .ThenInclude(i => i.Technician)
                .Where(i => i.IssueDate >= startDate && i.IssueDate <= endDate)
                .ToListAsync();
        }

        public async Task<IEnumerable<Invoice>> GetOverdueAsync()
        {
            var today = DateTime.UtcNow.Date;
            return await _context.Invoices
                .Include(i => i.Intervention)
                    .ThenInclude(i => i.Client)
                .Include(i => i.Intervention)
                    .ThenInclude(i => i.Technician)
                .Where(i => i.Status == InvoiceStatus.Issued && i.DueDate < today)
                .ToListAsync();
        }

        public async Task<bool> ExistsAsync(Guid id)
        {
            return await _context.Invoices.AnyAsync(i => i.Id == id);
        }

        public async Task<bool> InvoiceNumberExistsAsync(string invoiceNumber)
        {
            return await _context.Invoices.AnyAsync(i => i.InvoiceNumber == invoiceNumber);
        }

        public async Task AddAsync(Invoice invoice)
        {
            await _context.Invoices.AddAsync(invoice);
        }

        public Task UpdateAsync(Invoice invoice)
        {
            _context.Entry(invoice).State = EntityState.Modified;
            return Task.CompletedTask;
        }

        public Task DeleteAsync(Guid id)
        {
            var invoice = _context.Invoices.Find(id);
            if (invoice != null)
            {
                _context.Invoices.Remove(invoice);
            }
            return Task.CompletedTask;
        }
    }
}
