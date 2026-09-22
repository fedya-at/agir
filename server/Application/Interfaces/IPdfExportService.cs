using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Interfaces
{
    public interface IPdfExportService
    {
        Task<byte[]> ExportToPdf<T>(IEnumerable<T> data, string title);
    }

}
