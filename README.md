# Forte Checkout — Blazor integration sample

This repository is a **reference integration** for [Forte Checkout](https://www.forte.net/) in an ASP.NET Core **Blazor Server** app. It demonstrates **three ways** to bring checkout into your site: a **modal** overlay, and **embedded** checkout with either **automatic launch** or **click-to-launch**.

---

## What this sample shows

| Integration | Route | Behavior |
|---------------|--------|------------|
| **Embedded — auto launch** | `/automaticdemo` | Checkout loads in-page as soon as you open the demo. |
| **Embedded — click to launch** | `/clickdemo` | Checkout loads in-page after you click a button (lazy init). |
| **Modal** | `/modaldemo` | Checkout opens in a modal dialog over your content. |

From the home page (`/`), each flow has a **Test Now** link that matches the option above.

After a payment attempt, the app can redirect to **`/success`** or **`/error`** depending on the callback result (see the individual page components for how callbacks are wired).

---

## Prerequisites

- **.NET SDK** matching this project (this sample targets **.NET 10**; use the same or newer SDK that supports that target framework).

---

## Setup

1. **Clone or copy** this project and open a terminal in the project root.

2. **Restore dependencies**

   ```bash
   dotnet restore
   ```

3. **Configure Forte settings**

   Edit `appsettings.json` (or use **User Secrets** / environment-specific files in production) and set the `Fco` section. Values come from your Forte integration or sandbox credentials:

   | Key | Purpose |
   |----------|---------|
   | `ApiAccessId` | API access identifier used when building checkout requests. |
   | `ApiSecureKey` | Secret key used with signing utilities in this demo. |
   | `VersionNumber` | Version string passed to checkout (e.g. `1.0`). |
   | `LocationId` | Your Forte location ID. |
   | `CheckoutBaseUrl` | Checkout host base URL (no trailing slash), e.g. sandbox: `https://sandbox.forte.net/checkout`. |

4. **Review the checkout URL helper** (optional)

   `FcoOptions.CheckoutUrl` in `FcoOptions.cs` builds URLs from `CheckoutBaseUrl`. The app exposes **`GET /api/utc`**, which proxies to the checkout host’s `/getUTC` so the browser can fetch UTC time same-origin for signing.

---

## Run the app

From the project root:

```bash
dotnet run
```

Then open the URL for your launch profile (see `Properties/launchSettings.json`). The **http** profile uses **`http://localhost:5193`** by default. Use the home page links or navigate directly to `/automaticdemo`, `/clickdemo`, or `/modaldemo`.

## Tech stack

- ASP.NET Core, Blazor Server (interactive server components), .NET 10

This project is intended for **learning and integration testing**; replace demo credentials and URLs with your own.
