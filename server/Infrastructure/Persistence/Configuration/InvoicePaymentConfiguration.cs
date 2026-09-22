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
    public class InvoicePaymentConfiguration : IEntityTypeConfiguration<InvoicePayment>
    {
        public void Configure(EntityTypeBuilder<InvoicePayment> builder)
        {
            builder.HasKey(ip => ip.Id);

            builder.Property(ip => ip.Amount)
                .IsRequired()
                .HasPrecision(10, 2);

            builder.Property(ip => ip.PaymentDate)
                .IsRequired();

            builder.Property(ip => ip.PaymentMethod)
                .IsRequired()
                .HasMaxLength(50);

            builder.Property(ip => ip.Reference)
                .HasMaxLength(100);

            builder.HasIndex(ip => ip.InvoiceId);
            builder.HasIndex(ip => ip.PaymentDate);

            // Relationships
            builder.HasOne(ip => ip.Invoice)
                .WithMany()
                .HasForeignKey(ip => ip.InvoiceId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
