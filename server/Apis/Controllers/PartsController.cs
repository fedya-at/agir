using Application.DTOs;
using Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Apis.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class PartsController : ControllerBase
    {
        private readonly IPartService _partService;

        public PartsController(IPartService partService)
        {
            _partService = partService ?? throw new ArgumentNullException(nameof(partService));
        }

        // GET: api/Parts
        [HttpGet]
        [Authorize(Roles = "Admin,Technician")]
        public async Task<ActionResult<IEnumerable<PartDto>>> GetParts()
        {
            var parts = await _partService.GetAllPartsAsync();
            return Ok(parts);
        }

        // GET: api/Parts/5
        [HttpGet("{id}")]
        [Authorize(Roles = "Admin,Technician")]
        public async Task<ActionResult<PartDto>> GetPart(Guid id)
        {
            var part = await _partService.GetPartByIdAsync(id);

            if (part == null)
            {
                return NotFound();
            }

            return Ok(part);
        }

        // GET: api/Parts/search?term=keyboard
        [HttpGet("search")]
        [Authorize(Roles = "Admin,Technician")]
        public async Task<ActionResult<IEnumerable<PartDto>>> SearchParts([FromQuery] string term)
        {
            var parts = await _partService.SearchPartsAsync(term);
            return Ok(parts);
        }

        // GET: api/Parts/lowstock
        [HttpGet("lowstock")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<IEnumerable<PartDto>>> GetLowStockParts()
        {
            var parts = await _partService.GetLowStockPartsAsync();
            return Ok(parts);
        }

        // POST: api/Parts
        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<PartDto>> CreatePart(CreatePartDto partDto)
        {
            try
            {
                var createdPart = await _partService.CreatePartAsync(partDto);
                return CreatedAtAction(nameof(GetPart), new { id = createdPart.Id }, createdPart);
            }
            catch (ArgumentNullException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new { message = ex.Message });
            }
        }

        // PUT: api/Parts/5
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdatePart(Guid id, UpdatePartDto partDto)
        {
            try
            {
                var updatedPart = await _partService.UpdatePartAsync(id, partDto);
                return Ok(updatedPart);
            }
            catch (InvalidOperationException ex) when (ex.Message.Contains("not found"))
            {
                return NotFound(new { message = ex.Message });
            }
            catch (ArgumentNullException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new { message = ex.Message });
            }
        }

        // DELETE: api/Parts/5
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeletePart(Guid id)
        {
            try
            {
                await _partService.DeletePartAsync(id);
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

        // PUT: api/Parts/5/addstock
        [HttpPut("{id}/addstock")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> AddStock(Guid id, [FromBody] int quantity)
        {
            try
            {
                if (quantity <= 0)
                {
                    return BadRequest(new { message = "Quantity must be greater than zero" });
                }

                var part = await _partService.AddStockAsync(id, quantity);
                return Ok(part);
            }
            catch (InvalidOperationException ex) when (ex.Message.Contains("not found"))
            {
                return NotFound(new { message = ex.Message });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new { message = ex.Message });
            }
        }

        // PUT: api/Parts/5/removestock
        [HttpPut("{id}/removestock")]
        [Authorize(Roles = "Admin,Technician")]
        public async Task<IActionResult> RemoveStock(Guid id, [FromBody] int quantity)
        {
            try
            {
                if (quantity <= 0)
                {
                    return BadRequest(new { message = "Quantity must be greater than zero" });
                }

                var part = await _partService.RemoveStockAsync(id, quantity);
                return Ok(part);
            }
            catch (InvalidOperationException ex) when (ex.Message.Contains("not found"))
            {
                return NotFound(new { message = ex.Message });
            }
            catch (ArgumentException ex)
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
