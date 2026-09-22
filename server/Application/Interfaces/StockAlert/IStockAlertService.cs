using System.Threading.Tasks;

namespace Application.Interfaces
{
    public interface IStockAlertService
    {
        Task CheckStockLevelsAsync();
    }
}