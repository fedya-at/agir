using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection.Emit;
using System.Text;
using System.Threading.Tasks;

namespace Infrastructure.Persistence.Context
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
        {
        }
        public DbSet<Client> Clients { get; set; }
        public DbSet<Technician> Technicians { get; set; }
        public DbSet<Intervention> Interventions { get; set; }
        public DbSet<Part> Parts { get; set; }
        public DbSet<InterventionPart> InterventionParts { get; set; }
        public DbSet<Invoice> Invoices { get; set; }
        public DbSet<InvoicePayment> InvoicePayments { get; set; }
        public DbSet<User> Users { get; set; }
        public DbSet<Admin> Admins { get; set; }
        public DbSet<History> Histories { get; set; }

        public DbSet<Alert> Alerts { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Apply entity configurations
            modelBuilder.ApplyConfigurationsFromAssembly(typeof(ApplicationDbContext).Assembly);
        }

        public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
        {
            foreach (var entry in ChangeTracker.Entries<BaseEntity>())
            {
                switch (entry.State)
                {
                    case EntityState.Added:
                        entry.Entity.GetType().GetProperty("CreatedAt")?.SetValue(entry.Entity, DateTime.UtcNow);
                        entry.Entity.UpdateModifiedDate();
                        break;
                    case EntityState.Modified:
                        entry.Entity.UpdateModifiedDate();
                        break;
                }
            }

            return base.SaveChangesAsync(cancellationToken);
        }
    }
}
