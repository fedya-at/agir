using System.Collections.Generic;
using System.Threading.Tasks;

namespace Application.Interfaces
{
    public interface IExcelExportService
    {
        public byte[] ExportToExcel<T>(IEnumerable<T> data, string sheetName);
    }
}