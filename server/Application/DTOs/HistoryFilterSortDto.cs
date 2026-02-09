using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.DTOs
{
    public class HistoryFilterSortDto
    {
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public string Action { get; set; }
        public string EntityName { get; set; }
        public Guid UserId { get; set; }
        public string SortBy { get; set; }
        public bool IsAscending { get; set; }
        public int PageNumber { get; set; }
        public int PageSize { get; set; }
    }
}
