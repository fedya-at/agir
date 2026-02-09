using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Interfaces
{
    public interface ICsvExportService
    {
        Task<byte[]> ExportToCsv<T>(IEnumerable<T> data);
    }
}
