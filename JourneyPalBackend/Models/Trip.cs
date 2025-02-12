using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations.Schema;

namespace JourneyPalBackend.Models
{
    public class Trip
    {
        public int Id { get; set; }
        public User User { get; set; }
        public string TripName { get; set; }
        public string Destination { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
    }
}
