using FatCat.Infrastructure;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;

namespace FatCat.Tests;

public sealed class FatCatApiFactory : WebApplicationFactory<Program>
{
    private readonly string _connectionString = $"Data Source=fatcat-tests-{Guid.NewGuid():N};Mode=Memory;Cache=Shared";
    private SqliteConnection? _keeperConnection;

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.ConfigureServices(services =>
        {
            services.RemoveAll<DbContextOptions<FatCatDbContext>>();
            _keeperConnection ??= new SqliteConnection(_connectionString);
            if (_keeperConnection.State != System.Data.ConnectionState.Open)
            {
                _keeperConnection.Open();
            }
            services.AddDbContext<FatCatDbContext>(options =>
                options.UseSqlite(_connectionString));
        });
    }

    protected override void Dispose(bool disposing)
    {
        base.Dispose(disposing);
        _keeperConnection?.Dispose();
    }
}
