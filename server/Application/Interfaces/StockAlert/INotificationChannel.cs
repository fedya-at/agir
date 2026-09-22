using Domain.Entities;
using System.Threading.Tasks;

namespace Application.Interfaces
{
    public interface INotificationChannel
    {
        Task SendAsync(Alert alert);
    }
}