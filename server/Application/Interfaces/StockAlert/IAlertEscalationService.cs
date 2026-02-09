using System.Threading.Tasks;

namespace Application.Interfaces
{
    public interface IAlertEscalationService
    {
        Task ProcessEscalationsAsync();
    }
}