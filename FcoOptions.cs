namespace fco_blazor_demo;

public class FcoOptions
{
    public const string SectionName = "Fco";

    public string ApiAccessId { get; set; } = "";
    public string ApiSecureKey { get; set; } = "";
    public string VersionNumber { get; set; } = "1.0";
    public string LocationId { get; set; } = "";
    public string CheckoutBaseUrl { get; set; } = "https://sandbox.forte.net/checkout";

    public string CheckoutUrl(string path)
    {
        var baseUrl = CheckoutBaseUrl.TrimEnd('/');
        var p = path.StartsWith('/') ? path : "/" + path;
        return baseUrl + p;
    }
}
