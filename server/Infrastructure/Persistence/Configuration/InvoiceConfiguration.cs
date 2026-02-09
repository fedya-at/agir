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
    public class InvoiceConfiguration : IEntityTypeConfiguration<Invoice>
    {
        public void Configure(EntityTypeBuilder<Invoice> builder)
        {
            builder.HasKey(i => i.Id);

            builder.Property(i => i.InvoiceNumber)
                .IsRequired()
                .HasMaxLength(50);

            builder.Property(i => i.IssueDate)
                .IsRequired();

            builder.Property(i => i.DueDate)
                .IsRequired();

            builder.Property(i => i.LaborCost)
                .IsRequired()
                .HasMaxLength(500); ;

            builder.Property(i => i.TotalPartsCost)
                .IsRequired()
                .HasPrecision(10, 2); ;

            builder.Property(i => i.TotalAmount)
                .IsRequired()
                .HasColumnType("decimal(10, 2)");

            builder.Property(i => i.Status)
                .IsRequired()
                .HasConversion<string>();

            builder.HasIndex(i => i.InterventionId)
                .IsUnique();

            builder.HasIndex(i => i.InvoiceNumber)
                .IsUnique();

            builder.HasIndex(i => i.Status);
            builder.HasIndex(i => i.IssueDate);

            // Relationships
            builder.HasOne(i => i.Intervention)
                .WithOne(i => i.Invoice)
                .HasForeignKey<Invoice>(i => i.InterventionId)
                .OnDelete(DeleteBehavior.Cascade);

            // One-to-many relationship with InvoicePayment
            builder.HasMany<InvoicePayment>()
                .WithOne(ip => ip.Invoice)
                .HasForeignKey(ip => ip.InvoiceId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}

