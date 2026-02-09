using Application.DTOs;
using Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Apis.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class ClientsController : ControllerBase
    {
        private readonly IClientService _clientService;

        public ClientsController(IClientService clientService)
        {
            _clientService = clientService ?? throw new ArgumentNullException(nameof(clientService));
        }
        // POST: api/clients/register
        [HttpPost("register")]
        [AllowAnonymous] // Allow anyone to register as a client
        public async Task<ActionResult<ClientDto>> RegisterClient(CreateClientDto clientDto)
        {
            try
            {
                var createdClient = await _clientService.CreateClientAsync(clientDto);
                // The response should be a ClientDto, not a generic UserDto
                return CreatedAtAction(nameof(GetClient), new { id = createdClient.Id }, createdClient);
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An unexpected error occurred." });
            }
        }

        // GET: api/Clients
        [HttpGet]
        [Authorize(Roles = "Admin,Technician")]
        public async Task<ActionResult<IEnumerable<ClientDto>>> GetClients()
        {
            var clients = await _clientService.GetAllClientsAsync();
            return Ok(clients);
        }

        // GET: api/Clients/5
        [HttpGet("{id}")]
        [Authorize(Roles = "Admin,Technician,Client")]
        public async Task<ActionResult<ClientDto>> GetClient(Guid id)
        {
            var client = await _clientService.GetClientByIdAsync(id);

            if (client == null)
            {
                return NotFound();
            }

            // If user is a client, they can only view their own data
            if (User.IsInRole("Client"))
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (userId != id.ToString())
                {
                    return Forbid();
                }
            }

            return Ok(client);
        }

        // GET: api/Clients/email/john@example.com
        [HttpGet("email/{email}")]
        [Authorize(Roles = "Admin,Technician")]
        public async Task<ActionResult<ClientDto>> GetClientByEmail(string email)
        {
            var client = await _clientService.GetClientByEmailAsync(email);

            if (client == null)
            {
                return NotFound();
            }

            return Ok(client);
        }
        
        // GET: api/Clients/search?term=john
        [HttpGet("search")]
        [Authorize(Roles = "Admin,Technician")]
        public async Task<ActionResult<IEnumerable<ClientDto>>> SearchClients([FromQuery] string term)
        {
            var clients = await _clientService.SearchClientsAsync(term);
            return Ok(clients);
        }

        // POST: api/Clients
        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<ClientDto>> CreateClient(CreateClientDto clientDto)
        {
            try
            {
                var createdClient = await _clientService.CreateClientAsync(clientDto);
                return CreatedAtAction(nameof(GetClient), new { id = createdClient.Id }, createdClient);
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

        // PUT: api/Clients/5
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin,Client")]
        public async Task<IActionResult> UpdateClient(Guid id, UpdateClientDto clientDto)
        {
            // Authorization check: Only admin or the client themselves can update.
            if (User.IsInRole("Client"))
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (userId != id.ToString())
                {
                    return Forbid();
                }
            }

            try
            {
                var updatedClient = await _clientService.UpdateClientAsync(id, clientDto);
                return Ok(updatedClient);
            }
            catch (InvalidOperationException ex) when (ex.Message.Contains("not found"))
            {
                return NotFound(new { message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(new { message = ex.Message });
            }
        }

        // DELETE: api/Clients/5
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteClient(Guid id)
        {
            try
            {
                await _clientService.DeleteClientAsync(id);
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

        // GET: api/Clients/5/interventions
        [HttpGet("{id}/interventions")]
        [Authorize(Roles = "Admin,Technician,Client")]
        public async Task<ActionResult<IEnumerable<InterventionDto>>> GetClientInterventions(Guid id)
        {
            try
            {
                // If user is a client, they can only view their own interventions
                if (User.IsInRole("Client"))
                {
                    var client = await _clientService.GetClientByIdAsync(id);
                    if (client == null)
                    {
                        return NotFound();
                    }

                    var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
                    if (userId != null && id.ToString() != userId)
                    {
                        return Forbid();
                    }
                }

                var interventions = await _clientService.GetClientInterventionsAsync(id);
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