namespace JourneyPalBackend.Models
{
    public class Event
    {
        public int Id { get; set; }
        public string EventName { get; set; }
        public string EventDescription { get; set; }
        public string EventLocation { get; set; }
        public string[] EventLinks { get; set; }
        public DateTime EventDate { get; set; }
        public int TripId { get; set; }
        public virtual Trip Trip { get; set; }
    }
}