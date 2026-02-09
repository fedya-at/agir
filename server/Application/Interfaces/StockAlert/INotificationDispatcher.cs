using Domain.Entities;
using System.Threading.Tasks;

namespace Application.Interfaces
{
    public interface INotificationDispatcher
    {
        Task DispatchAsync(Alert alert);
    }
}
