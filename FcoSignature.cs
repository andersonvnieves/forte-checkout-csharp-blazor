namespace fco_blazor_demo;

public static class FcoSignature
{
    public static string BuildMessage(
        string apiAccessId,
        string method,
        string versionNumber,
        string subtotal,
        string utcTime,
        string orderNumber)
    {
        return $"{apiAccessId}|{method}|{versionNumber}|{subtotal}|{utcTime}|{orderNumber}||";
    }
}
