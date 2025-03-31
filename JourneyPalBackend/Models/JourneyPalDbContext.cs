using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace JourneyPalBackend.Models
{
    public class JourneyPalDbContext : IdentityDbContext
    {
        public JourneyPalDbContext(DbContextOptions<JourneyPalDbContext> options) : base(options) { }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configure cascade delete for User -> Trips
            modelBuilder.Entity<User>()
                .HasMany(u => u.Trips)
                .WithOne(t => t.User)
                .HasForeignKey(t => t.UserId)
                .OnDelete(DeleteBehavior.Cascade); // Cascade delete trips when user is deleted

            // Configure cascade delete for Trip -> Events
            modelBuilder.Entity<Trip>()
                .HasMany(t => t.Events)
                .WithOne(e => e.Trip)
                .HasForeignKey(e => e.TripId)
                .OnDelete(DeleteBehavior.Cascade); // Cascade delete events when trip is deleted

            // Configure cascade delete for Trip -> Notes
            modelBuilder.Entity<Trip>()
                .HasMany(t => t.Notes)
                .WithOne(n => n.Trip)
                .HasForeignKey(n => n.TripId)
                .OnDelete(DeleteBehavior.Cascade); // Cascade delete notes when trip is deleted
        }

        public DbSet<User> Users { get; set; }
        public DbSet<Trip> Trips { get; set; }
        public DbSet<Event> Events { get; set; }
        public DbSet<TripNote> TripNotes { get; set; }
    }
}
