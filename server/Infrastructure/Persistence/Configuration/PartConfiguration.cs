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
    public class PartConfiguration : IEntityTypeConfiguration<Part>
    {
        public void Configure(EntityTypeBuilder<Part> builder)
        {
            builder.HasKey(p => p.Id);

            builder.Property(p => p.Name)
                .IsRequired()
                .HasMaxLength(100);

            builder.Property(p => p.Description)
                .HasColumnType("text");

            builder.Property(p => p.Price)
                .IsRequired()
                .HasColumnType("decimal(10, 2)");

            builder.Property(p => p.StockQuantity)
                .IsRequired()
                .HasDefaultValue(0);

            builder.Property(p => p.MinStockLevel)
                .IsRequired()
                .HasDefaultValue(5);

            builder.HasIndex(p => p.Name);
            builder.HasIndex(p => p.StockQuantity);
        }
    }
}
