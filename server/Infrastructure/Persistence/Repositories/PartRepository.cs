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
    public class PartRepository : IPartRepository
    {
        private readonly ApplicationDbContext _context;

        public PartRepository(ApplicationDbContext context)
        {
            _context = context ?? throw new ArgumentNullException(nameof(context));
        }

        public async Task<IEnumerable<Part>> GetAllAsync()
        {
            return await _context.Parts.ToListAsync();
        }

        public async Task<Part> GetByIdAsync(Guid id)
        {
            return await _context.Parts.FindAsync(id);
        }

        public async Task<IEnumerable<Part>> GetByIdsAsync(IEnumerable<Guid> ids)
        {
            return await _context.Parts.Where(p => ids.Contains(p.Id)).ToListAsync();
        }

        public async Task<IEnumerable<Part>> SearchAsync(string searchTerm)
        {
            if (string.IsNullOrWhiteSpace(searchTerm))
                return await GetAllAsync();

            return await _context.Parts
                .Where(p => p.Name.Contains(searchTerm) ||
                            p.Description.Contains(searchTerm))
                .ToListAsync();
        }

        public async Task<IEnumerable<Part>> GetLowStockAsync()
        {
            return await _context.Parts
                .Where(p => p.StockQuantity <= p.MinStockLevel)
                .ToListAsync();
        }

        public async Task<bool> ExistsAsync(Guid id)
        {
            return await _context.Parts.AnyAsync(p => p.Id == id);
        }

        public async Task AddAsync(Part part)
        {
            await _context.Parts.AddAsync(part);
        }

        public Task UpdateAsync(Part part)
        {
            _context.Entry(part).State = EntityState.Modified;
            return Task.CompletedTask;
        }

        public Task DeleteAsync(Guid id)
        {
            var part = _context.Parts.Find(id);
            if (part != null)
            {
                _context.Parts.Remove(part);
            }
            return Task.CompletedTask;
        }

        public async Task<IEnumerable<double>> GetDailyUsageAsync(Guid partId, int days)
        {

            // This is a placeholder implementation.
            // You need to replace this with actual logic to query your historical data
            // (e.g., sales, intervention parts usage) to calculate daily usage.
            // For example, if you track sales:
            // var usageData = await _context.SalesRecords
            //     .Where(sr => sr.PartId == partId && sr.SaleDate >= DateTime.UtcNow.AddDays(-days))
            //     .GroupBy(sr => sr.SaleDate.Date)
            //     .Select(g => (double)g.Sum(sr => sr.Quantity))
            //     .ToListAsync();

            // For now, returning mock data:
            return await Task.FromResult(new List<double> { 5, 7, 6, 8, 5, 9, 7, 6, 5, 8, 7, 6, 5, 4, 3, 2, 1, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16 }.Take(days));
        }
    }
}
