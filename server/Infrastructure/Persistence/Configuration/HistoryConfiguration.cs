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
    public class HistoryConfiguration : IEntityTypeConfiguration<History>
    {
        public void Configure(EntityTypeBuilder<History> builder)
        {
            builder.HasKey(h => h.Id); // Explicit primary key

            builder.Property(h => h.Timestamp).IsRequired();
            builder.Property(h => h.Action).IsRequired().HasMaxLength(50);
            builder.Property(h => h.EntityName).IsRequired().HasMaxLength(100);
            builder.Property(h => h.EntityId).IsRequired().HasMaxLength(50);
            builder.Property(h => h.Changes)
                .IsRequired()
                .HasColumnType("nvarchar(max)");
               
            builder.Property(h => h.UserId).HasMaxLength(50);

        }
    }
}
