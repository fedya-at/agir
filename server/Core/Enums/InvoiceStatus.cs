using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Enums
{
    public enum InvoiceStatus
    {
        Draft = 0,
        Issued = 1,
        Paid = 2,
        Cancelled = 3
    }
}
