using FatCat.Application;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace FatCat.Infrastructure;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddFatCatInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("FatCat")
            ?? "Data Source=fatcat-dev.db";
        services.AddDbContext<FatCatDbContext>(options => options.UseSqlite(connectionString));
        services.AddScoped<IFatCatRepository, EfFatCatRepository>();
        return services;
    }
}
