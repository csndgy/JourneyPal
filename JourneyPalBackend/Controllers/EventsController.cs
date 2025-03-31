using Google;
using JourneyPalBackend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.JsonPatch;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace JourneyPalBackend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(AuthenticationSchemes ="Bearer")]
    public class EventsController : Controller
    {
        private readonly JourneyPalDbContext _context;
        private readonly UserManager<User> _userManager;

        public EventsController(JourneyPalDbContext context, UserManager<User> userManager)
        {
            _context = context;
            _userManager = userManager;
        }

        // POST: api/events
        [HttpGet("trip/{tripId}")]
        public async Task<ActionResult<IEnumerable<EventDto>>> GetEventsForTrip(int tripId)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            // Verify trip belongs to user
            var tripExists = await _context.Trips
                .AnyAsync(t => t.Id == tripId && t.UserId == userId);

            if (!tripExists) return NotFound("Trip not found or doesn't belong to user");

            var events = await _context.Events
                .Where(e => e.TripId == tripId)
                .Select(e => new EventDto
                {
                    Id = e.Id,
                    EventName = e.EventName,
                    EventDescription = e.EventDescription,
                    EventLocation = e.EventLocation,
                    EventLinks = e.EventLinks,
                    EventDate = e.EventDate,
                    TripId = e.TripId
                })
                .ToListAsync();

            return Ok(events);
        }

        // GET: api/events/5
        [HttpGet("{id}")]
        public async Task<ActionResult<EventDto>> GetEvent(int id)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            var eventEntity = await _context.Events
                .Include(e => e.Trip)
                .FirstOrDefaultAsync(e => e.Id == id && e.Trip.UserId == userId);

            if (eventEntity == null) return NotFound();

            return new EventDto
            {
                Id = eventEntity.Id,
                EventName = eventEntity.EventName,
                EventDescription = eventEntity.EventDescription,
                EventLocation = eventEntity.EventLocation,
                EventLinks = eventEntity.EventLinks,
                EventDate = eventEntity.EventDate,
                TripId = eventEntity.TripId
            };
        }

        // POST: api/events
        [HttpPost]
        public async Task<ActionResult<EventDto>> CreateEvent(CreateEventDto createEventDto)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            // Verify the trip belongs to the user
            var trip = await _context.Trips
                .FirstOrDefaultAsync(t => t.Id == createEventDto.TripId && t.UserId == userId);

            if (trip == null) return BadRequest("Trip not found or doesn't belong to user");

            var eventEntity = new Event
            {
                EventName = createEventDto.EventName,
                EventDescription = createEventDto.EventDescription,
                EventLocation = createEventDto.EventLocation,
                EventLinks = createEventDto.EventLinks,
                EventDate = (DateTime)createEventDto.EventDate,
                TripId = createEventDto.TripId
            };

            _context.Events.Add(eventEntity);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetEvent),
                new { id = eventEntity.Id },
                new EventDto
                {
                    Id = eventEntity.Id,
                    EventName = eventEntity.EventName,
                    EventDescription = eventEntity.EventDescription,
                    EventLocation = eventEntity.EventLocation,
                    EventLinks = eventEntity.EventLinks,
                    EventDate = eventEntity.EventDate,
                    TripId = eventEntity.TripId
                });
        }

        // PATCH: api/events/5
        [HttpPatch("{id}")]
        public async Task<IActionResult> UpdateEvent(int id, UpdateEventDto request)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            var eventEntity = await _context.Events
                .Include(e => e.Trip)
                .FirstOrDefaultAsync(e => e.Id == id && e.Trip.UserId == userId);

            if (eventEntity == null) return NotFound();

            // Only update fields that have values in the DTO
            if (!string.IsNullOrEmpty(request.EventName))
            {
                eventEntity.EventName = request.EventName;
            }

            if (!string.IsNullOrEmpty(request.EventDescription))
            {
                eventEntity.EventDescription = request.EventDescription;
            }

            if (!string.IsNullOrEmpty(request.EventLocation))
            {
                eventEntity.EventLocation = request.EventLocation;
            }

            if (request.EventLinks != null && request.EventLinks.Length > 0)
            {
                eventEntity.EventLinks = request.EventLinks;
            }

            if (request.EventDate != default) // or use updateDto.EventDate != DateTime.MinValue
            {
                eventEntity.EventDate = (DateTime)request.EventDate;
            }

            await _context.SaveChangesAsync();

            return NoContent();
        }

        // DELETE: api/events/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteEvent(int id)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            var eventEntity = await _context.Events
                .Include(e => e.Trip)
                .FirstOrDefaultAsync(e => e.Id == id && e.Trip.UserId == userId);

            if (eventEntity == null) return NotFound();

            _context.Events.Remove(eventEntity);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
