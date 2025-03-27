namespace JourneyPalBackend.Models
{
    public class TripNote
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public string Content { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public int TripId { get; set; }
        public virtual Trip Trip { get; set; }
    }
}
