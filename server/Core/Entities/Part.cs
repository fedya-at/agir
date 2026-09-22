using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Entities
{
    public class Part : BaseEntity
    {
        public string Name { get; private set; }
        public string Description { get; private set; }
        public Decimal Price { get; private set; }
        public int StockQuantity { get; private set; }
        public int MinStockLevel { get; private set; }
        public bool IsCriticalStock => StockQuantity <= (MinStockLevel / 2);

        public ICollection<InterventionPart> InterventionParts { get; private set; } = new List<InterventionPart>();
        // For EF Core
        protected Part() : base() { }

        public Part(string name, string description, Decimal price, int stockQuantity, int minStockLevel) : base()
        {
            if (price <= 0)
                throw new ArgumentException("Price must be greater than zero", nameof(price));

            if (minStockLevel < 0)
                throw new ArgumentException("Minimum stock level cannot be negative", nameof(minStockLevel));

            Name = name ?? throw new ArgumentNullException(nameof(name));
            Description = description;
            Price = price;
            StockQuantity = stockQuantity;
            MinStockLevel = minStockLevel;
        }

        public void Update(string name, string description, Decimal price, int minStockLevel)
        {
            if (price <= 0)
                throw new ArgumentException("Price must be greater than zero", nameof(price));

            if (minStockLevel < 0)
                throw new ArgumentException("Minimum stock level cannot be negative", nameof(minStockLevel));

            Name = name ?? throw new ArgumentNullException(nameof(name));
            Description = description;
            Price = price;
            MinStockLevel = minStockLevel;
            UpdateModifiedDate();
        }

        public void AddStock(int quantity)
        {
            if (quantity <= 0)
                throw new ArgumentException("Quantity must be greater than zero", nameof(quantity));

            StockQuantity += quantity;
            UpdateModifiedDate();
        }

        public void RemoveStock(int quantity)
        {
            if (quantity <= 0)
                throw new ArgumentException("Quantity must be greater than zero", nameof(quantity));

            if (StockQuantity < quantity)
                throw new InvalidOperationException($"Not enough stock available. Current stock: {StockQuantity}, Requested: {quantity}");

            StockQuantity -= quantity;
            if (IsCriticalStock)
            {
                throw new InvalidOperationException($"you are in a critical stock: {StockQuantity}, Requested: {quantity}");
            }
            UpdateModifiedDate();
        }

        public bool IsLowStock()
        {
            return StockQuantity <= MinStockLevel;
        }
    }
}
