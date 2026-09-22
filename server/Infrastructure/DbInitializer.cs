using Application.Interfaces;
using Domain.Entities;
using Domain.Enums;
using Infrastructure.Persistence.Context;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Infrastructure
{
    public static class DbInitializer
    {
        public static async Task SeedData(IServiceProvider serviceProvider)
        {
            using var scope = serviceProvider.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            var passwordHasher = scope.ServiceProvider.GetRequiredService<IPasswordHasher>();

            // Apply migrations if they don't exist
            await context.Database.MigrateAsync();
            if (await context.Users.AnyAsync())
            {
                return; // DB has been seeded
            }

            var admin = new Admin(
                "admin",
                "admin@repair.com",
                passwordHasher.HashPassword("Admin123!"),
                "Main Administrator",
                "555-000-0001"
            );


            await context.Users.AddAsync(admin);

            // Rest of your seeding code...
            var tech1 = new Technician(
                "tech1",
                "tech1@repair.com",
                passwordHasher.HashPassword("Tech123!"),
                "John Smith",
                "555-123-4567",
                "Hardware Repair",
                DateTime.UtcNow.AddYears(-2)
            );

            var client1 = new Client(
                "client1",
                "client1@example.com",
                passwordHasher.HashPassword("Client123!"),
                "Robert Johnson",
                "555-111-2222",
                "123 Main St, Anytown, USA"
            );

            await context.Users.AddRangeAsync(tech1, client1);
            await context.SaveChangesAsync();

            // Seed parts if none exist
            if (!context.Parts.Any())
            {
                var parts = new List<Part>
                {
                    new Part(
                        "RAM 8GB DDR4",
                        "8GB DDR4 2666MHz Memory Module",
                        79.99m,
                        15,
                        5
                    ),
                    new Part(
                        "SSD 500GB",
                        "500GB SATA SSD Drive",
                        99.99m,
                        10,
                        3
                    ),
                    new Part(
                        "Laptop Battery",
                        "Generic Laptop Battery 4400mAh",
                        59.99m,
                        8,
                        4
                    ),
                    new Part(
                        "Keyboard",
                        "Standard USB Keyboard",
                        29.99m,
                        20,
                        5
                    ),
                    new Part(
                        "Power Supply",
                        "500W ATX Power Supply",
                        69.99m,
                        7,
                        3
                    )
                };

                await context.Parts.AddRangeAsync(parts);
                await context.SaveChangesAsync();
            }
           
        }
    }
}
