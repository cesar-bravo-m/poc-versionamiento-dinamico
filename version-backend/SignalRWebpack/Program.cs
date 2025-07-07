using SignalRWebpack.Hubs;
using SignalRWebpack.Services;

var MyAllowSpecificOrigins = "_myAllowSpecificOrigins";

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddSignalR();
builder.Services.AddControllers();
builder.Services.AddSingleton<VersionesService>();
builder.Services.AddCors(options =>
{
    options.AddPolicy(name: MyAllowSpecificOrigins,
        policy =>
        {
            policy
            .WithOrigins("http://localhost:3001", "http://localhost:5018", "http://localhost:5173")
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
        });
});
var app = builder.Build();

app.UseCors(MyAllowSpecificOrigins);
app.UseDefaultFiles();
app.UseStaticFiles();

app.MapHub<ChatHub>("/hub");
app.MapGet("/", () => "Hello World!");
app.MapControllers();

app.Run();
