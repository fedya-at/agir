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
    public class InterventionPartConfiguration : IEntityTypeConfiguration<InterventionPart>
    {
        public void Configure(EntityTypeBuilder<InterventionPart> builder)
        {
            builder.HasKey(ip => ip.Id);

            builder.Property(ip => ip.Quantity)
                .IsRequired();

            builder.Property(ip => ip.UnitPrice)
                .IsRequired()
                .HasColumnType("decimal(10, 2)");

            builder.HasIndex(ip => ip.InterventionId);
            builder.HasIndex(ip => ip.PartId);
            builder.HasIndex(ip => new { ip.InterventionId, ip.PartId })
                .IsUnique();

            // Relationships
            builder.HasOne(ip => ip.Intervention)
                .WithMany(i => i.InterventionParts)
                .HasForeignKey(ip => ip.InterventionId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(ip => ip.Part)
                .WithMany(p => p.InterventionParts)  // Added this line
                .HasForeignKey(ip => ip.PartId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}


