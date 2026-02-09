using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Entities
{
    public class InterventionPart : BaseEntity
    {
        public Guid InterventionId { get; private set; }
        public Guid PartId { get; private set; }
        public int Quantity { get; private set; }
        public Decimal UnitPrice { get; private set; }

        // Navigation properties
        public Intervention Intervention { get; private set; }
        public Part Part { get; private set; }
        private decimal? _cachedTotalPrice;

        public decimal GetTotalPrice() =>
            _cachedTotalPrice ??= Quantity * UnitPrice;
        // For EF Core
        protected InterventionPart() : base() { }

        public InterventionPart(Guid interventionId, Guid partId, int quantity, Decimal unitPrice) : base()
        {
            if (quantity <= 0)
                throw new ArgumentException("Quantity must be greater than zero", nameof(quantity));

            if (unitPrice <= 0)
                throw new ArgumentException("Unit price must be greater than zero", nameof(unitPrice));

            InterventionId = interventionId;
            PartId = partId;
            Quantity = quantity;
            UnitPrice = unitPrice;
        }

        public void UpdateQuantity(int quantity)
        {
            if (quantity <= 0)
                throw new ArgumentException("Quantity must be greater than zero", nameof(quantity));

            Quantity = quantity;
            _cachedTotalPrice = null; 
            UpdateModifiedDate();
        }

        public void UpdateUnitPrice(Decimal unitPrice)
        {
            if (unitPrice <= 0)
                throw new ArgumentException("Unit price must be greater than zero", nameof(unitPrice));

            UnitPrice = unitPrice;
            UpdateModifiedDate();
        }

       
    }
}
