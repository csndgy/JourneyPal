
namespace JourneyPalBackend.Models
{
    public class Trip
    {
        public int Id { get; set; }
        public string TripName { get; set; }
        public string Destination { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public string UserId { get; set; }
        public virtual User User { get; set; }
        public virtual ICollection<Event> Events { get; set; } = new List<Event>();
        public virtual ICollection<TripNote> Notes { get; set; } = new List<TripNote>();

    }
}
