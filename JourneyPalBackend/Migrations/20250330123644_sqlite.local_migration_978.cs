using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace JourneyPalBackend.Migrations
{
    /// <inheritdoc />
    public partial class sqlitelocal_migration_978 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "EventEstimatedTime",
                table: "Events");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<TimeSpan>(
                name: "EventEstimatedTime",
                table: "Events",
                type: "TEXT",
                nullable: false,
                defaultValue: new TimeSpan(0, 0, 0, 0, 0));
        }
    }
}
