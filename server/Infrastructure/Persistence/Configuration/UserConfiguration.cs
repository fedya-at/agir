using Domain.Entities;
using Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Infrastructure.Persistence.Configuration
{
    public class UserConfiguration : IEntityTypeConfiguration<User>
    {
        public void Configure(EntityTypeBuilder<User> builder)
        {
            builder.ToTable("Users");

            // Configure TPH inheritance with "Role" as discriminator
            builder.HasDiscriminator<UserRole>("Role")
                  .HasValue<Admin>(UserRole.Admin)      
                  .HasValue<Technician>(UserRole.Technician) 
                  .HasValue<Client>(UserRole.Client);     

            builder.HasKey(u => u.Id);
            builder.Property(u => u.Role).IsRequired();
            builder.Property(u => u.Username).IsRequired().HasMaxLength(50);
            builder.HasIndex(u => u.Username).IsUnique();
            builder.Property(u => u.Email).IsRequired().HasMaxLength(100);
            builder.HasIndex(u => u.Email).IsUnique();
            builder.Property(u => u.PasswordHash).IsRequired().HasMaxLength(255);
            builder.Property(u => u.Name).IsRequired().HasMaxLength(100);
            builder.Property(u => u.Phone).HasMaxLength(20);
            builder.Property(u => u.IsActive).IsRequired().HasDefaultValue(true);
        }
    }
}


