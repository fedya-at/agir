using Application.DTOs;
using Application.Interfaces;
using Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    [Route("api/intervention-parts")]
    [ApiController]
    [Authorize(Roles = "Technician,Admin")]
    public class InterventionPartsController : ControllerBase
    {
        private readonly IInterventionPartService _interventionPartService;
        private readonly IHostEnvironment _hostEnvironment;
        private readonly ILogger<InterventionPartsController> _logger;

        public InterventionPartsController(
            IInterventionPartService interventionPartService,
            IHostEnvironment hostEnvironment,
            ILogger<InterventionPartsController> logger)
        {
            _interventionPartService = interventionPartService;
            _hostEnvironment = hostEnvironment;
            _logger = logger;
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<InterventionPartDto>> GetById(Guid id)
        {
            try
            {
                var part = await _interventionPartService.GetByIdAsync(id);
                if (part == null) return NotFound(new { message = "Part not found" });

                return Ok(part);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching intervention part {PartId}", id);
                return StatusCode(500, new { message = "Internal server error" });
            }
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<InterventionPartDto>>> GetByInterventionId([FromQuery] Guid interventionId)
        {
            try
            {
                _logger.LogInformation("Fetching parts for intervention {InterventionId}", interventionId);

                var parts = await _interventionPartService.GetByInterventionIdAsync(interventionId);
                if (!parts.Any())
                {
                    _logger.LogWarning("No parts found for intervention {InterventionId}", interventionId);
                    return NotFound(new { message = "No parts found for this intervention" });
                }

                return Ok(parts);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching parts for intervention {InterventionId}", interventionId);
                return StatusCode(500, new
                {
                    message = "An error occurred while fetching parts",
                    detail = _hostEnvironment.IsDevelopment() ? ex.Message : null
                });
            }
        }

        [HttpPost]
        [Authorize(Roles = "Admin,Technician")]
        public async Task<ActionResult<InterventionPartDto>> AddPartToIntervention(
            [FromQuery] Guid interventionId,
            [FromBody] CreateInterventionPartDto createDto)
        {
            try
            {
                var result = await _interventionPartService.AddPartToInterventionAsync(interventionId, createDto);
                return Ok(result);
            }
            catch (NotFoundException ex)
            {
                _logger.LogWarning(ex, "AddPartToIntervention failed: {Message}", ex.Message);
                return NotFound(new { message = ex.Message });
            }
            catch (BusinessException ex)
            {
                _logger.LogWarning(ex, "Business rule error: {Message}", ex.Message);
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error adding part to intervention {InterventionId}", interventionId);
                return StatusCode(500, new { message = "An error occurred while adding the part" });
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateInterventionPart(Guid id, [FromBody] UpdateInterventionPartDto dto)
        {
            try
            {
                await _interventionPartService.UpdateInterventionPartAsync(id, dto);
                return NoContent();
            }
            catch (NotFoundException ex)
            {
                _logger.LogWarning(ex, "Update failed: {Message}", ex.Message);
                return NotFound(new { message = ex.Message });
            }
            catch (BusinessException ex)
            {
                _logger.LogWarning(ex, "Update failed: {Message}", ex.Message);
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating part {PartId}", id);
                return StatusCode(500, new { message = "An error occurred while updating the part" });
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> RemovePartFromIntervention(Guid id)
        {
            try
            {
                await _interventionPartService.RemovePartFromInterventionAsync(id);
                return NoContent();
            }
            catch (NotFoundException ex)
            {
                _logger.LogWarning(ex, "Delete failed: {Message}", ex.Message);
                return NotFound(new { message = ex.Message });
            }
            catch (BusinessException ex)
            {
                _logger.LogWarning(ex, "Delete failed: {Message}", ex.Message);
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting part {PartId}", id);
                return StatusCode(500, new { message = "An error occurred while deleting the part" });
            }
        }
    }
}
