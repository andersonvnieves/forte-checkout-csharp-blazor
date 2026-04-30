using System.Text.Json.Serialization;

namespace fco_blazor_demo;

/// <summary>
/// Forte Checkout callback body (JSON fields surfaced on result pages; mirrors forte-checkout-angular).
/// </summary>
public sealed class FcoCallbackPayload
{
    [JsonPropertyName("event")]
    public string? Event { get; set; }

    [JsonPropertyName("request_id")]
    public string? RequestId { get; set; }

    [JsonPropertyName("response_code")]
    public string? ResponseCode { get; set; }

    [JsonPropertyName("response_description")]
    public string? ResponseDescription { get; set; }

    public bool HasAny =>
        !string.IsNullOrEmpty(Event)
        || !string.IsNullOrEmpty(RequestId)
        || !string.IsNullOrEmpty(ResponseCode)
        || !string.IsNullOrEmpty(ResponseDescription);
}
