using Microsoft.EntityFrameworkCore;

namespace JourneyPalBackend.Models
{
    public class JourneyPalDbContext : DbContext
    {
        public JourneyPalDbContext(DbContextOptions<JourneyPalDbContext> options) : base(options) { }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<User>().ToTable("Users");
        }

        public DbSet<User> Users { get; set; }
    }
}
