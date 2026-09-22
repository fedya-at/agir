using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Persistence.Configuration
{
    public class AlertConfiguration : IEntityTypeConfiguration<Alert>
    {
        public void Configure(EntityTypeBuilder<Alert> builder)
        {
            builder.HasKey(a => a.Id);
            builder.Property(a => a.PartId).IsRequired();
            builder.Property(a => a.PartName).IsRequired().HasMaxLength(250);
            builder.Property(a => a.CurrentStock).IsRequired();
            builder.Property(a => a.Threshold).IsRequired();
            builder.Property(a => a.Message).HasMaxLength(1000);
            builder.Property(a => a.Status).IsRequired();
            builder.Property(a => a.CreatedAt).IsRequired();
            builder.Property(a => a.IsEscalated).IsRequired();
            builder.Property(a => a.RecipientEmail).HasMaxLength(250);
            builder.Property(a => a.RecipientPhone).HasMaxLength(50);

            // Example: Indexing for faster queries
            builder.HasIndex(a => a.Status);
            builder.HasIndex(a => a.CreatedAt);
        }
    }
}