using JourneyPalBackend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.JsonPatch;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Net;
using System.Security.Claims;

namespace JourneyPalBackend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(AuthenticationSchemes ="Bearer")]
    public class TripsController : Controller
    {
        private readonly JourneyPalDbContext _context;
        private readonly UserManager<User> _userManager;

        public TripsController(JourneyPalDbContext context, UserManager<User> userManager)
        {
            _context = context;
            _userManager = userManager;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<TripDto>>> GetTrips()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            return await _context.Trips
                .Where(t => t.UserId == userId)
                .Include(t => t.Events)
                .Include(t => t.Notes)
                .Select(t => new TripDto
                {
                    Id = t.Id,
                    TripName = t.TripName,
                    Destination = t.Destination,
                    StartDate = t.StartDate,
                    EndDate = t.EndDate,
                    UserId = t.UserId,
                    Events = t.Events.Select(e => new EventDto
                    {
                        Id = e.Id,
                        EventName = e.EventName,
                        EventDescription = e.EventDescription,
                        EventLocation = e.EventLocation,
                        EventLinks = e.EventLinks,
                        EventDate = e.EventDate,
                        EventEstimatedTime = e.EventEstimatedTime,
                        TripId = e.TripId
                    }).ToList()
                })
                .ToListAsync();
        }

        // GET: api/trips/5
        [HttpGet("{id}")]
        public async Task<ActionResult<TripDetailsDto>> GetTrip(int id)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var trip = await _context.Trips
                .Include(t => t.Events)
                .Include(t => t.Notes)
                .FirstOrDefaultAsync(t => t.Id == id && t.UserId == userId);

            if (trip == null) return NotFound();

            return new TripDetailsDto
            {
                Id = trip.Id,
                UserId = trip.UserId,
                TripName = trip.TripName,
                Destination = trip.Destination,
                StartDate = trip.StartDate,
                EndDate = trip.EndDate,
                Events = trip.Events.Select(e => new EventDto
                {
                    Id = e.Id,
                    EventName = e.EventName,
                    EventDescription = e.EventDescription,
                    EventLocation = e.EventLocation,
                    EventLinks = e.EventLinks,
                    EventDate = e.EventDate,
                    EventEstimatedTime = e.EventEstimatedTime,
                    TripId = e.TripId
                }).ToList(),
                Notes = trip.Notes.Select(n => new TripNoteDto
                {
                    Id = n.Id,
                    Title = n.Title,
                    Content = n.Content,
                    CreatedAt = n.CreatedAt,
                    TripId = n.TripId
                }).ToList()
            };
        }

        // POST: api/trips
        [HttpPost]
        public async Task<ActionResult<TripDto>> CreateTrip(CreateTripDto createTripDto)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var trip = new Trip
            {
                TripName = createTripDto.TripName,
                Destination = createTripDto.Destination,
                StartDate = createTripDto.StartDate,
                EndDate = createTripDto.EndDate,
                UserId = userId
            };

            _context.Trips.Add(trip);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetTrip),
                new { id = trip.Id },
                new TripDto
                {
                    Id = trip.Id,
                    TripName = trip.TripName,
                    Destination = trip.Destination,
                    StartDate = trip.StartDate,
                    EndDate = trip.EndDate,
                    UserId = trip.UserId,
                    Events = new List<EventDto>()
                });
        }

        // PATCH: api/trips/5
        [HttpPatch("{id}")]
        public async Task<IActionResult> UpdateTrip(int id, JsonPatchDocument<UpdateTripDto> patchDoc)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var trip = await _context.Trips.FirstOrDefaultAsync(t => t.Id == id && t.UserId == userId);

            if (trip == null) return NotFound();

            var tripToPatch = new UpdateTripDto
            {
                TripName = trip.TripName,
                Destination = trip.Destination,
                StartDate = trip.StartDate,
                EndDate = trip.EndDate
            };

            patchDoc.ApplyTo(tripToPatch, (Microsoft.AspNetCore.JsonPatch.Adapters.IObjectAdapter)ModelState);

            if (!TryValidateModel(tripToPatch))
            {
                return ValidationProblem(ModelState);
            }

            trip.TripName = tripToPatch.TripName;
            trip.Destination = tripToPatch.Destination;
            trip.StartDate = tripToPatch.StartDate;
            trip.EndDate = tripToPatch.EndDate;

            await _context.SaveChangesAsync();

            return NoContent();
        }

        // DELETE: api/trips/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTrip(int id)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var trip = await _context.Trips.FirstOrDefaultAsync(t => t.Id == id && t.UserId == userId);

            if (trip == null) return NotFound();

            _context.Trips.Remove(trip);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // Note-related endpoints

        // GET: api/trips/5/notes
        [HttpGet("{tripId}/notes")]
        public async Task<ActionResult<IEnumerable<TripNoteDto>>> GetTripNotes(int tripId)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var tripExists = await _context.Trips.AnyAsync(t => t.Id == tripId && t.UserId == userId);

            if (!tripExists) return NotFound("Trip not found or doesn't belong to user");

            var notes = await _context.TripNotes
                .Where(n => n.TripId == tripId)
                .Select(n => new TripNoteDto
                {
                    Id = n.Id,
                    Title = n.Title,
                    Content = n.Content,
                    CreatedAt = n.CreatedAt,
                    TripId = n.TripId
                })
                .ToListAsync();

            return notes;
        }

        // GET: api/trips/5/notes/10
        [HttpGet("{tripId}/notes/{noteId}")]
        public async Task<ActionResult<TripNoteDto>> GetTripNote(int tripId, int noteId)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var tripExists = await _context.Trips.AnyAsync(t => t.Id == tripId && t.UserId == userId);
            if (!tripExists) return NotFound("Trip not found or doesn't belong to user");

            var note = await _context.TripNotes
                .FirstOrDefaultAsync(n => n.Id == noteId && n.TripId == tripId);
            if (note == null) return NotFound("Note not found");

            return new TripNoteDto
            {
                Id = note.Id,
                Title = note.Title,
                Content = note.Content,
                CreatedAt = note.CreatedAt,
                TripId = note.TripId
            };
        }

        // POST: api/trips/5/notes
        [HttpPost("{tripId}/notes")]
        public async Task<ActionResult<TripNoteDto>> CreateTripNote(int tripId, CreateTripNoteDto createNoteDto)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var trip = await _context.Trips.FirstOrDefaultAsync(t => t.Id == tripId && t.UserId == userId);

            if (trip == null) return NotFound("Trip not found or doesn't belong to user");

            var note = new TripNote
            {
                Title = createNoteDto.Title,
                Content = createNoteDto.Content,
                TripId = tripId,
                CreatedAt = DateTime.UtcNow
            };

            _context.TripNotes.Add(note);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetTripNote),
                new { tripId = tripId, noteId = note.Id },
                new TripNoteDto
                {
                    Id = note.Id,
                    Title = note.Title,
                    Content = note.Content,
                    CreatedAt = note.CreatedAt,
                    TripId = note.TripId
                });
        }

        // PATCH: api/trips/5/notes/10
        [HttpPatch("{tripId}/notes/{noteId}")]
        public async Task<IActionResult> UpdateTripNote(int tripId, int noteId, JsonPatchDocument<UpdateTripNoteDto> patchDoc)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var tripExists = await _context.Trips.AnyAsync(t => t.Id == tripId && t.UserId == userId);
            if (!tripExists) return NotFound("Trip not found or doesn't belong to user");

            var note = await _context.TripNotes.FirstOrDefaultAsync(n => n.Id == noteId && n.TripId == tripId);
            if (note == null) return NotFound("Note not found");

            var noteToPatch = new UpdateTripNoteDto
            {
                Title = note.Title,
                Content = note.Content
            };

            patchDoc.ApplyTo(noteToPatch, (Microsoft.AspNetCore.JsonPatch.Adapters.IObjectAdapter)ModelState);

            if (!TryValidateModel(noteToPatch))
            {
                return ValidationProblem(ModelState);
            }

            note.Title = noteToPatch.Title;
            note.Content = noteToPatch.Content;

            await _context.SaveChangesAsync();

            return NoContent();
        }

        // DELETE: api/trips/5/notes/10
        [HttpDelete("{tripId}/notes/{noteId}")]
        public async Task<IActionResult> DeleteTripNote(int tripId, int noteId)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var tripExists = await _context.Trips.AnyAsync(t => t.Id == tripId && t.UserId == userId);
            if (!tripExists) return NotFound("Trip not found or doesn't belong to user");

            var note = await _context.TripNotes.FirstOrDefaultAsync(n => n.Id == noteId && n.TripId == tripId);
            if (note == null) return NotFound("Note not found");

            _context.TripNotes.Remove(note);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }

    // DTOs
    public class CreateTripDto
    {
        public string TripName { get; set; }
        public string Destination { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
    }

    public class UpdateTripDto : CreateTripDto { }

    public class TripDto : CreateTripDto
    {
        public int Id { get; set; }
        public string UserId { get; set; }
        public List<EventDto> Events { get; set; } = new();
    }

    public class TripDetailsDto : TripDto
    {
        public List<TripNoteDto> Notes { get; set; } = new();
    }

    public class CreateEventDto
    {
        public string EventName { get; set; }
        public string EventDescription { get; set; }
        public string EventLocation { get; set; }
        public string[] EventLinks { get; set; }
        public DateTime EventDate { get; set; }
        public TimeSpan EventEstimatedTime { get; set; }
        public int TripId { get; set; }
    }

    public class UpdateEventDto : CreateEventDto
    {
        public new int TripId { get; }
    }

    public class EventDto : CreateEventDto
    {
        public int Id { get; set; }
        public int TripId { get; set; }
    }

    public class CreateTripNoteDto
    {
        public string Title { get; set; }
        public string Content { get; set; }
    }

    public class UpdateTripNoteDto : CreateTripNoteDto { }

    public class TripNoteDto : CreateTripNoteDto
    {
        public int Id { get; set; }
        public DateTime CreatedAt { get; set; }
        public int TripId { get; set; }
    }
}
