using Application.DTOs;
using Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Apis.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class TechniciansController : ControllerBase
    {
        private readonly ITechnicianService _technicianService;

        public TechniciansController(ITechnicianService technicianService)
        {
            _technicianService = technicianService ?? throw new ArgumentNullException(nameof(technicianService));
        }

        // POST: api/technicians
        [HttpPost]
        [Authorize(Roles = "Admin")] // Only Admins can create new Technicians
        public async Task<ActionResult<TechnicianDto>> CreateTechnician(CreateTechnicianDto technicianDto)
        {
            try
            {
                var createdTechnician = await _technicianService.CreateTechnicianAsync(technicianDto);
                return CreatedAtAction(nameof(GetTechnician), new { id = createdTechnician.Id }, createdTechnician);
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(new { message = ex.Message });
            }
        }

        // GET: api/Technicians
        [HttpGet]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<IEnumerable<TechnicianDto>>> GetTechnicians()
        {
            var technicians = await _technicianService.GetAllTechniciansAsync();
            return Ok(technicians);
        }

        // GET: api/Technicians/active
        [HttpGet("active")]
        [Authorize(Roles = "Admin,Technician,Client")]
        public async Task<ActionResult<IEnumerable<TechnicianDto>>> GetActiveTechnicians()
        {
            var technicians = await _technicianService.GetActiveTechniciansAsync();
            return Ok(technicians);
        }

        // GET: api/Technicians/5
        [HttpGet("{id}")]
        [Authorize(Roles = "Admin,Technician")]
        public async Task<ActionResult<TechnicianDto>> GetTechnician(Guid id)
        {
            var technician = await _technicianService.GetTechnicianByIdAsync(id);

            if (technician == null)
            {
                return NotFound();
            }

            // If user is a technician, they can only view their own data
            if (User.IsInRole("Technician"))
            {
                var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
                if (userId != null && id.ToString() != userId)
                {
                    return Forbid();
                }
            }

            return Ok(technician);
        }


      

        // GET: api/Technicians/email/john@example.com
        [HttpGet("email/{email}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<TechnicianDto>> GetTechnicianByEmail(string email)
        {
            var technician = await _technicianService.GetTechnicianByEmailAsync(email);

            if (technician == null)
            {
                return NotFound();
            }

            return Ok(technician);
        }

        // GET: api/Technicians/search?term=john
        [HttpGet("search")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<IEnumerable<TechnicianDto>>> SearchTechnicians([FromQuery] string term)
        {
            var technicians = await _technicianService.SearchTechniciansAsync(term);
            return Ok(technicians);
        }

       
        

        // PUT: api/Technicians/5
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin,Technician")]
        public async Task<IActionResult> UpdateTechnician(Guid id, UpdateTechnicianDto technicianDto)
        {
            try
            {
                // If user is a technician, they can only update their own data
                if (User.IsInRole("Technician"))
                {
                    var technician = await _technicianService.GetTechnicianByIdAsync(id);
                    if (technician == null)
                    {
                        return NotFound();
                    }

                    var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
                    if (userId != null && id.ToString() != userId)
                    {
                        return Forbid();
                    }
                }

                var updatedTechnician = await _technicianService.UpdateTechnicianAsync(id, technicianDto);
                return Ok(updatedTechnician);
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

        // DELETE: api/Technicians/5
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteTechnician(Guid id)
        {
            try
            {
                await _technicianService.DeleteTechnicianAsync(id);
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

        // PUT: api/Technicians/5/activate
        [HttpPut("{id}/activate")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> ActivateTechnician(Guid id)
        {
            try
            {
                var technician = await _technicianService.ActivateTechnicianAsync(id);
                return Ok(technician);
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

        // PUT: api/Technicians/5/deactivate
        [HttpPut("{id}/deactivate")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeactivateTechnician(Guid id)
        {
            try
            {
                var technician = await _technicianService.DeactivateTechnicianAsync(id);
                return Ok(technician);
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

        // GET: api/Technicians/5/interventions
        [HttpGet("{id}/interventions")]
        [Authorize(Roles = "Admin,Technician")]
        public async Task<ActionResult<IEnumerable<InterventionDto>>> GetTechnicianInterventions(Guid id)
        {
            try
            {
                // If user is a technician, they can only view their own interventions
                if (User.IsInRole("Technician"))
                {
                    var technician = await _technicianService.GetTechnicianByIdAsync(id);
                    if (technician == null)
                    {
                        return NotFound();
                    }

                    var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
                    if (userId != null && id.ToString() != userId)
                    {
                        return Forbid();
                    }
                }

                var interventions = await _technicianService.GetTechnicianInterventionsAsync(id);
                return Ok(interventions);
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
    }
}
