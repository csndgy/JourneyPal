using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace JourneyPalAdmin.Models
{
    public class Event
    {
        public int Id { get; set; }
        public string EventName { get; set; }
        public string EventDescription { get; set; }
        public string EventLocation { get; set; }
        public string[] EventLinks { get; set; }
        public DateTime EventDate { get; set; }
        public TimeSpan EventEstimatedTime { get; set; }
        public string TripId { get; set; }
    }
}
