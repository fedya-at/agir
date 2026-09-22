using Application.DTOs;
using Application.Interfaces;
using Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using System.Security.Claims;

namespace Apis.Controllers
{

    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class InterventionsController : ControllerBase
    {
        private readonly IInterventionService _interventionService;
        private readonly IClientService _clientService;
        private readonly ITechnicianService _technicianService;
        private readonly ILogger<InterventionsController> _logger;


        public InterventionsController(
            IInterventionService interventionService,
            IClientService clientService,
            ITechnicianService technicianService,
              ILogger<InterventionsController> logger)
        {
            _interventionService = interventionService ?? throw new ArgumentNullException(nameof(interventionService));
            _clientService = clientService ?? throw new ArgumentNullException(nameof(clientService));
            _technicianService = technicianService ?? throw new ArgumentNullException(nameof(technicianService));
            _logger = logger;

        }

        // GET: api/Interventions
        [HttpGet]
        [Authorize(Roles = "Admin,Technician")]
        public async Task<ActionResult<IEnumerable<InterventionDto>>> GetInterventions()
        {
            var interventions = await _interventionService.GetAllInterventionsAsync();
            return Ok(interventions);
        }

        // GET: api/Interventions/5
        [HttpGet("{id}")]
        [Authorize(Roles = "Admin,Technician,Client")]
        public async Task<ActionResult<InterventionDto>> GetIntervention(Guid id)
        {
            var intervention = await _interventionService.GetInterventionByIdAsync(id);

            if (intervention == null)
            {
                return NotFound();
            }

            // If user is a client, they can only view their own interventions
          

          

            return Ok(intervention);
        }

        // GET: api/Interventions/client/{clientId}
        [HttpGet("client/{clientId}")]
        [Authorize(Roles = "Admin,Technician,Client")]
        public async Task<ActionResult<IEnumerable<InterventionDto>>> GetInterventionsByClientId(Guid clientId)
        {
            // If user is a client, they can only view their own interventions
            if (User.IsInRole("Client"))
            {
                // First try to get the client by user ID
                var client = await _clientService.GetClientByIdAsync(
                    Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value));
                if (client == null || clientId != client.Id)
                {
                    return Forbid();
                }
            }
            var interventions = await _interventionService.GetInterventionsByClientIdAsync(clientId);
            return Ok(interventions);
        }

        [HttpGet("technician/{technicianId}")]
        [Authorize(Roles = "Admin,Technician")]
        public async Task<ActionResult<IEnumerable<InterventionDto>>> GetInterventionsByTechnicianId(Guid technicianId)
        {
            // If user is a technician, they can only view their own interventions
            if (User.IsInRole("Technician"))
            {
                // First try to get the technician by user ID
                var technician = await _technicianService.GetTechnicianByIdAsync(
                    Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value));

                if (technician == null || technicianId != technician.Id)
                {
                    return Forbid();
                }
            }

            var interventions = await _interventionService.GetInterventionsByTechnicianIdAsync(technicianId);
            return Ok(interventions);
        }



        // GET: api/Interventions/status/InProgress
        [HttpGet("status/{status}")]
        [Authorize(Roles = "Admin,Technician,Client")]
        public async Task<ActionResult<IEnumerable<InterventionDto>>> GetInterventionsByStatus(InterventionStatus status)
        {
            var interventions = await _interventionService.GetInterventionsByStatusAsync(status);

            // If user is a technician, filter to only show their interventions
            if (User.IsInRole("Technician"))
            {
                var technician = await _technicianService.GetTechnicianByIdAsync(
                    Guid.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value));

                if (technician != null)
                {
                    var technicianInterventions = new List<InterventionDto>();
                    foreach (var intervention in interventions)
                    {
                        if (intervention.TechnicianId == technician.Id)
                        {
                            technicianInterventions.Add(intervention);
                        }
                    }
                    return Ok(technicianInterventions);
                }
            }

            return Ok(interventions);
        }

        // GET: api/Interventions/daterange?startDate=2023-01-01&endDate=2023-12-31
        [HttpGet("daterange")]
        [Authorize(Roles = "Admin,Technician")]
        public async Task<ActionResult<IEnumerable<InterventionDto>>> GetInterventionsByDateRange(
            [FromQuery] DateTime startDate, [FromQuery] DateTime endDate)
        {
            var interventions = await _interventionService.GetInterventionsByDateRangeAsync(startDate, endDate);
            return Ok(interventions);
        }

        // POST: api/Interventions
        [HttpPost]
        [Authorize(Roles = "Admin,Client,Technician")]
        public async Task<ActionResult<InterventionDto>> CreateIntervention(CreateInterventionDto interventionDto)
        {
            try
            {
                var createdIntervention = await _interventionService.CreateInterventionAsync(interventionDto);
                return CreatedAtAction(nameof(GetIntervention), new { id = createdIntervention.Id }, createdIntervention);
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new { message = ex.Message });
            }
        }

        // PUT: api/Interventions/5
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin,Technician")]
        public async Task<IActionResult> UpdateIntervention(Guid id, UpdateInterventionDto interventionDto)
        {
            try
            {
                // If user is a technician, they can only update interventions assigned to them
                if (User.IsInRole("Technician"))
                {
                    var intervention = await _interventionService.GetInterventionByIdAsync(id);
                    if (intervention == null)
                    {
                        return NotFound();
                    }

                    var technician = await _technicianService.GetTechnicianByIdAsync(
                        Guid.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value));

                    if (technician == null || intervention.TechnicianId != technician.Id)
                    {
                        return Forbid();
                    }
                }

                var updatedIntervention = await _interventionService.UpdateInterventionAsync(id, interventionDto);
                return Ok(updatedIntervention);
            }
            catch (InvalidOperationException ex) when (ex.Message.Contains("not found"))
            {
                return NotFound(new { message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new { message = ex.Message });
            }
        }

        // DELETE: api/Interventions/5
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteIntervention(Guid id)
        {
            try
            {
                await _interventionService.DeleteInterventionAsync(id);
                return NoContent();
            }
            catch (InvalidOperationException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new { message = ex.Message });
            }
        }

        // PUT: api/Interventions/5/assign/6
        [HttpPut("{id}/assign/{technicianId}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> AssignTechnician(Guid id, Guid technicianId)
        {
            try
            {
                var intervention = await _interventionService.AssignTechnicianAsync(id, technicianId);
                return Ok(intervention);
            }
            catch (InvalidOperationException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new { message = ex.Message });
            }
        }
        [HttpPut("{id}/status")]
        [Authorize(Roles = "Admin,Technician")]
        public async Task<ActionResult<InterventionDto>> UpdateInterventionStatusAsync(Guid id, InterventionStatus newStatus)
        {
            try
            {
                _logger.LogInformation($"Starting status update for intervention {id} to status {newStatus}");
                _logger.LogInformation($"Authenticated user: {User.Identity?.Name}, Roles: {string.Join(",", User.Claims.Where(c => c.Type == ClaimTypes.Role).Select(c => c.Value))}");

                // Get the intervention first
                var intervention = await _interventionService.GetInterventionByIdAsync(id);
                if (intervention == null)
                {
                    _logger.LogWarning($"Intervention {id} not found");
                    return NotFound();
                }

                _logger.LogInformation($"Found intervention with TechnicianId: {intervention.TechnicianId}");

                // If user is a technician, validate their permissions
                if (User.IsInRole("Technician"))
                {
                    _logger.LogInformation("User is a technician - performing technician validation");

                    // Get user ID from claims (sub claim)
                    var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                    if (string.IsNullOrEmpty(userIdClaim))
                    {
                        _logger.LogWarning("User ID claim is missing");
                        return Forbid();
                    }

                    _logger.LogInformation($"User ID from claims: {userIdClaim}");

                    if (!Guid.TryParse(userIdClaim, out var userId))
                    {
                        _logger.LogWarning($"Failed to parse user ID: {userIdClaim}");
                        return Forbid();
                    }

                    // Get technician by USER ID
                    var technician = await _technicianService.GetTechnicianByIdAsync(userId);
                    if (technician == null)
                    {
                        _logger.LogWarning($"Technician for user {userId} not found in database");
                        return Forbid();
                    }

                    _logger.LogInformation($"Technician record found: {technician.Id}");

                    // Verify intervention is assigned to this technician
                    if (intervention.TechnicianId != technician.Id)
                    {
                        _logger.LogWarning($"Intervention assigned to {intervention.TechnicianId} but technician is {technician.Id}");
                        return Forbid();
                    }

                    // Validate allowed status changes for technicians
                    if (newStatus != InterventionStatus.InProgress && newStatus != InterventionStatus.Completed)
                    {
                        _logger.LogWarning($"Technician attempted invalid status change to {newStatus}");
                        return BadRequest(new { message = "Technicians can only set status to InProgress or Completed" });
                    }
                }

                // Update the intervention status (ONLY STATUS UPDATE LOGIC REMAINS)
                _logger.LogInformation($"Updating intervention {id} to status {newStatus}");
                var updatedIntervention = await _interventionService.UpdateInterventionStatusAsync(id, newStatus);

                _logger.LogInformation($"Successfully updated intervention {id}");
                return Ok(updatedIntervention);
            }
            catch (InvalidOperationException ex) when (ex.Message.Contains("not found"))
            {
                _logger.LogWarning(ex, $"Not found error for intervention {id}");
                return NotFound(new { message = ex.Message });
            }
            catch (InvalidOperationException ex) when (ex.Message.Contains("Invalid status change"))
            {
                _logger.LogWarning(ex, $"Invalid status change for intervention {id}");
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error updating intervention {id} status");
                return StatusCode(StatusCodes.Status500InternalServerError, new { message = ex.Message });
            }
        }

        // POST: api/Interventions/5/parts
        [HttpPost("{id}/parts")]
        [Authorize(Roles = "Admin,Technician")]
        public async Task<IActionResult> AddPartToIntervention(Guid id, AddInterventionPartDto partDto)
        {
            try
            {
                // If user is a technician, they can only add parts to interventions assigned to them
                if (User.IsInRole("Technician"))
                {
                    var intervention = await _interventionService.GetInterventionByIdAsync(id);
                    if (intervention == null)
                    {
                        return NotFound();
                    }

                    var technician = await _technicianService.GetTechnicianByIdAsync(
                        Guid.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value));

                    if (technician == null || intervention.TechnicianId != technician.Id)
                    {
                        return Forbid();
                    }
                }

                var updatedIntervention = await _interventionService.AddPartToInterventionAsync(id, partDto);
                return Ok(updatedIntervention);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new { message = ex.Message });
            }
        }

        // DELETE: api/Interventions/5/parts/6
        [HttpDelete("{id}/parts/{partId}")]
        [Authorize(Roles = "Admin,Technician")]
        public async Task<IActionResult> RemovePartFromIntervention(Guid id, Guid partId)
        {
            try
            {
                // If user is a technician, they can only remove parts from interventions assigned to them
                if (User.IsInRole("Technician"))
                {
                    var intervention = await _interventionService.GetInterventionByIdAsync(id);
                    if (intervention == null)
                    {
                        return NotFound();
                    }

                    var technician = await _technicianService.GetTechnicianByIdAsync(
                        Guid.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value));

                    if (technician == null || intervention.TechnicianId != technician.Id)
                    {
                        return Forbid();
                    }
                }

                var updatedIntervention = await _interventionService.RemovePartFromInterventionAsync(id, partId);
                return Ok(updatedIntervention);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new { message = ex.Message });
            }
        }
    }
}
