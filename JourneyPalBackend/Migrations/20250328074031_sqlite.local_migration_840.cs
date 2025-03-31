using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace JourneyPalBackend.Migrations
{
    /// <inheritdoc />
    public partial class sqlitelocal_migration_840 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Title",
                table: "TripNotes");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Title",
                table: "TripNotes",
                type: "TEXT",
                nullable: false,
                defaultValue: "");
        }
    }
}
