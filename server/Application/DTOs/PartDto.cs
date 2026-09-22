using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.DTOs
{
    public class PartDto : BaseDto
    {
        public string Name { get; set; }
        public string Description { get; set; }
        public decimal Price { get; set; }
        public int StockQuantity { get; set; }
        public int MinStockLevel { get; set; }
        public bool IsLowStock { get; set; }


    }

    /// <summary>
    /// DTO for creating a new Part
    /// </summary>
    public class CreatePartDto
    {
        public string Name { get; set; }
        public string Description { get; set; }
        public decimal Price { get; set; }
        public int StockQuantity { get; set; }
        public int MinStockLevel { get; set; }
    }

    /// <summary>
    /// DTO for updating an existing Part
    /// </summary>
    public class UpdatePartDto
    {
        public string Name { get; set; }
        public string Description { get; set; }
        public decimal Price { get; set; }
        public int MinStockLevel { get; set; }
    }
}
