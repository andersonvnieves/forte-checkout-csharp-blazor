using fco_blazor_demo;
using fco_blazor_demo.Components;

var builder = WebApplication.CreateBuilder(args);

builder.Services.Configure<FcoOptions>(builder.Configuration.GetSection(FcoOptions.SectionName));
builder.Services.AddHttpClient();

// Add services to the container.
builder.Services.AddRazorComponents()
    .AddInteractiveServerComponents();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/server-error", createScopeForErrors: true);
    // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
    app.UseHsts();
}
app.UseStatusCodePagesWithReExecute("/not-found", createScopeForStatusCodePages: true);
app.UseHttpsRedirection();

app.MapGet("/api/utc", async (IHttpClientFactory httpFactory, IConfiguration configuration, CancellationToken ct) =>
{
    var opts = configuration.GetSection(FcoOptions.SectionName).Get<FcoOptions>() ?? new FcoOptions();
    var baseUrl = opts.CheckoutBaseUrl.TrimEnd('/');
    var client = httpFactory.CreateClient();
    var text = await client.GetStringAsync($"{baseUrl}/getUTC", ct);
    return Results.Text(text);
});

app.UseAntiforgery();

app.MapStaticAssets();
app.MapRazorComponents<App>()
    .AddInteractiveServerRenderMode();

app.Run();
