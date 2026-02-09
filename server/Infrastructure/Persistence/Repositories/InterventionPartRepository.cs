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
    public class InterventionPartRepository : IInterventionPartRepository
    {
        private readonly ApplicationDbContext _context;

        public InterventionPartRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<InterventionPart> GetByIdAsync(Guid id)
        {
            return await _context.InterventionParts
                .Include(ip => ip.Part)
                .Include(ip => ip.Intervention)
                .FirstOrDefaultAsync(ip => ip.Id == id);
        }
        public async Task<IEnumerable<InterventionPart>> GetByInterventionIdAsync(Guid interventionId)
        {
            return await _context.InterventionParts
                .AsNoTracking()
                .Include(ip => ip.Part) // Ensure Part is loaded
                .Where(ip => ip.InterventionId == interventionId)
                .ToListAsync();
        }
        public async Task<InterventionPart> GetByIdWithDetailsAsync(Guid id)
        {
            return await _context.InterventionParts
                .Include(ip => ip.Part)
                .FirstOrDefaultAsync(ip => ip.Id == id);
        }
        public async Task<InterventionPart> GetByIdWithPartAsync(Guid id)
        {
            return await _context.InterventionParts
                .Include(ip => ip.Part)
                .FirstOrDefaultAsync(ip => ip.Id == id);
        }
        public async Task AddAsync(InterventionPart interventionPart)
        {
            await _context.InterventionParts.AddAsync(interventionPart);
        }

        public async Task UpdateAsync(InterventionPart interventionPart)
        {
            _context.InterventionParts.Update(interventionPart);
            await Task.CompletedTask;
        }

        public async Task DeleteAsync(InterventionPart interventionPart)
        {
            _context.InterventionParts.Remove(interventionPart);
            await Task.CompletedTask;
        }

        public async Task<bool> ExistsAsync(Guid interventionId, Guid partId)
        {
            return await _context.InterventionParts
                .AnyAsync(ip => ip.InterventionId == interventionId && ip.PartId == partId);
        }
    }
}
