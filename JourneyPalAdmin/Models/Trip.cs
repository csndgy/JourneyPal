using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace JourneyPalAdmin.Models
{
    public class Trip
    {
        public int Id { get; set; }
        public string TripName { get; set; }
        public string Destination { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public string StayingLocation { get; set; }
        public string UserId { get; set; }
        public List<Event> Events { get; set; }
    }
}
