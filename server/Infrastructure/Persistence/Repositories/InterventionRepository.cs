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
    public class InterventionRepository : IInterventionRepository
    {
        private readonly ApplicationDbContext _context;

        public InterventionRepository(ApplicationDbContext context)
        {
            _context = context ?? throw new ArgumentNullException(nameof(context));
        }

        public async Task<IEnumerable<Intervention>> GetAllAsync()
        {
            return await _context.Interventions
                .Include(i => i.Client)
                .Include(i => i.Technician)
                .Include(i => i.InterventionParts)
                    .ThenInclude(ip => ip.Part)
                .ToListAsync();
        }

        public async Task<Intervention> GetByIdAsync(Guid id)
        {
            return await _context.Interventions
                .Include(i => i.Client)
                .Include(i => i.Technician)
                .Include(i => i.InterventionParts)
                    .ThenInclude(ip => ip.Part)
                .FirstOrDefaultAsync(i => i.Id == id);
        }

        public async Task<IEnumerable<Intervention>> GetByClientIdAsync(Guid clientId)
        {
            return await _context.Interventions
                .Include(i => i.Technician)
                .Include(i => i.InterventionParts)
                    .ThenInclude(ip => ip.Part)
                .Where(i => i.ClientId == clientId)
                .ToListAsync();
        }

        public async Task<IEnumerable<Intervention>> GetByTechnicianIdAsync(Guid technicianId)
        {
            return await _context.Interventions
                .Include(i => i.Client)
                .Include(i => i.InterventionParts)
                    .ThenInclude(ip => ip.Part)
                .Where(i => i.TechnicianId == technicianId)
                .ToListAsync();
        }

        public async Task<IEnumerable<Intervention>> GetByStatusAsync(InterventionStatus status)
        {
            return await _context.Interventions
                .Include(i => i.Client)
                .Include(i => i.Technician)
                .Include(i => i.InterventionParts)
                    .ThenInclude(ip => ip.Part)
                .Where(i => i.Status == status)
                .ToListAsync();
        }

        public async Task<IEnumerable<Intervention>> GetByDateRangeAsync(DateTime startDate, DateTime endDate)
        {
            return await _context.Interventions
                .Include(i => i.Client)
                .Include(i => i.Technician)
                .Include(i => i.InterventionParts)
                    .ThenInclude(ip => ip.Part)
                .Where(i => i.StartDate >= startDate && (i.EndDate == null || i.EndDate <= endDate))
                .ToListAsync();
        }

        public async Task<bool> ExistsAsync(Guid id)
        {
            return await _context.Interventions.AnyAsync(i => i.Id == id);
        }

        public async Task AddAsync(Intervention intervention)
        {
            await _context.Interventions.AddAsync(intervention);
        }

        public Task UpdateAsync(Intervention intervention)
        {
            _context.Entry(intervention).State = EntityState.Modified;
            return Task.CompletedTask;
        }

        public Task DeleteAsync(Guid id)
        {
            var intervention = _context.Interventions.Find(id);
            if (intervention != null)
            {
                _context.Interventions.Remove(intervention);
            }
            return Task.CompletedTask;
        }

    }
}
