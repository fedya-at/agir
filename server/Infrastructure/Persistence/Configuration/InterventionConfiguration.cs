using Domain.Entities;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Infrastructure.Persistence.Configuration
{
    public class InterventionConfiguration : IEntityTypeConfiguration<Intervention>
    {
        public void Configure(EntityTypeBuilder<Intervention> builder)
        {
            builder.HasKey(i => i.Id);

            builder.Property(i => i.Description)
                .IsRequired()
                .HasColumnType("text");

            builder.Property(i => i.StartDate)
                .IsRequired();

            builder.Property(i => i.EndDate);

            builder.Property(i => i.Status)
                .IsRequired()
                .HasConversion<string>();

            builder.HasIndex(i => i.ClientId);
            builder.HasIndex(i => i.TechnicianId);
            builder.HasIndex(i => i.Status);
            builder.HasIndex(i => i.StartDate);

            // Relationships
            builder.HasOne(i => i.Client)
                .WithMany(c => c.Interventions)
                .HasForeignKey(i => i.ClientId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(i => i.Technician)
                .WithMany(t => t.Interventions)
                .HasForeignKey(i => i.TechnicianId)
                .OnDelete(DeleteBehavior.SetNull);

            // One-to-one relationship with Invoice
            builder.HasOne(i => i.Invoice)
                .WithOne(inv => inv.Intervention)
                .HasForeignKey<Invoice>(inv => inv.InterventionId)
                .OnDelete(DeleteBehavior.Cascade);

            // One-to-many relationship with InterventionPart
            builder.HasMany(i => i.InterventionParts)
                .WithOne(ip => ip.Intervention)
                .HasForeignKey(ip => ip.InterventionId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
