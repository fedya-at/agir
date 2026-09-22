using Domain.Entities;
using Domain.Interfaces.Repositories;
using System.Threading.Tasks;

namespace YourNamespace.Extensions
{
    public static class RepositoryExtensions
    {
        public static async Task<Intervention> LoadClientAsync(this IInterventionRepository repository, Intervention intervention)
        {
            if (intervention.Client == null)
            {
                var fullIntervention = await repository.GetByIdAsync(intervention.Id);
                return fullIntervention; // Returns the intervention with loaded client
            }
            return intervention;
        }

        public static async Task<Intervention> LoadTechnicianAsync(this IInterventionRepository repository, Intervention intervention)
        {
            if (intervention.Technician == null && intervention.TechnicianId.HasValue)
            {
                var fullIntervention = await repository.GetByIdAsync(intervention.Id);
                return fullIntervention; // Returns the intervention with loaded technician
            }
            return intervention;
        }

        public static async Task<Intervention> LoadPartsAsync(this IInterventionRepository repository, Intervention intervention)
        {
            if (intervention.InterventionParts.Any() && intervention.InterventionParts.First().Part == null)
            {
                var fullIntervention = await repository.GetByIdAsync(intervention.Id);
                return fullIntervention; // Returns the intervention with loaded parts
            }
            return intervention;
        }
    }
}