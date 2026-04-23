---
title: Authentication
description: The mosaigo/appauth Go package, the /api/auth/config contract, and the three credentials every mos app supports.
---

Every mos-based app inherits the same authentication contract:

- **Master token** — a break-glass bearer credential stored at
  `<configDir>/secrets/master-token`. Prefix: `sk-master-…`. Treated
  as `RoleAdmin`.
- **Keycloak OIDC** — an Authorization-Code-with-PKCE flow driven
  by a `mosaigo.KeycloakConfig` entity in the app's config directory.
  Groups from the ID token map onto `RoleAdmin` / `RoleUser` based
  on the entity's `admin_group`.
- **Anonymous** — when neither is configured, or when a path is
  explicitly listed as `OptionalAuthPaths`.

Auth is **config-driven at the UI level**. When no `KeycloakConfig`
entity exists, the SPA hides every auth widget and the app presents
as open. Drop an entity into the config directory and the titlebar
gains a Sign-in button + Master-token input on the next reload.

## Server-side: `mosaigo/appauth`

Every app assembles its middleware from the same package:

```go
import "github.com/mosaigoio/mosaigo/appauth"

masterKey, _ := appauth.LoadMasterKey(appauth.MasterKeyLocation{
    EnvVar:    "MOSAPP_MASTER_KEY",
    ConfigDir: configDir,
})
master, _ := appauth.NewMasterAuthenticator(masterKey)

keycloakCfgs, _ := mcfg.ParseKeycloakConfigEntities(configBytes)
oidc, adminGroup, _ := appauth.BuildOIDC(keycloakCfgs, "mosapp-admins")

mw := appauth.Config{
    Master:            master,
    OIDC:              oidc,
    OIDCAdminGroup:    adminGroup,
    Realm:             "mosapp",
    PublicPaths:       appauth.DefaultPublicPaths,
    OptionalAuthPaths: []string{"/graphql"},
}.Middleware()
```

Per-app knobs:

| Field              | Purpose                                          |
|--------------------|--------------------------------------------------|
| `EnvVar`           | e.g. `MOSAPP_MASTER_KEY`, `MOSLAB_MASTER_KEY`    |
| `Realm`            | Surfaces in WWW-Authenticate on 401s             |
| `OIDCAdminGroup`   | Keycloak group that confers RoleAdmin            |
| `PublicPaths`      | Paths that bypass auth. Default includes `/healthz`, `/graphql`, `/playground`, `/`, `/favicon.svg`, `/assets`, `/api/auth/config`. |
| `OptionalAuthPaths` | Authenticate if a token is present; let anonymous through otherwise |

The resolved `Identity` (Source / Subject / Email / Role / Groups)
is attached to the request context. Handlers read it with
`appauth.FromContext(r.Context())`.

## The `/api/auth/config` contract

The backend exposes a single probe the SPA hits on boot:

```
GET /api/auth/config
{
  "enabled": true,
  "master_available": true,
  "issuer": "https://sso.example.com/realms/parkave",
  "client_id": "mosapp",
  "audience": "mosapp",
  "scopes": ["openid", "profile", "email"],
  "redirect_uri": "https://mosapp.example/",
  "app_name": "mosapp",
  "server_version": "0.2.0.<sha>"
}
```

Field semantics:

- `enabled` — **any auth entity is configured**. When false, the SPA
  hides all auth widgets. A bare master-token file does NOT flip
  this on; UI-level enablement is tied to the presence of a
  `mosaigo.KeycloakConfig` entity (or whatever auth kind an app
  registers in the future).
- `master_available` — a master-token file exists. The SPA uses this
  to decide whether to render the Master-token input as a fallback
  when `enabled=true`.
- `issuer` / `client_id` / `audience` / `scopes` / `redirect_uri` —
  OIDC discovery info. When `issuer` is empty the SPA only offers
  the master-token path.
- `app_name` / `server_version` — surfaced in the titlebar and
  StatusBar footer.

Implementations of this endpoint live in
[`mosapp/steps/landing/extend.go`](https://github.com/mosaigoio/mosapp)
as a reference. Any mos app adds its own stepdef (or wraps the
landing step) to produce this shape.

## SPA bootstrap

`MosShell` handles the full SPA bootstrap automatically. If you're
wiring the shell by hand:

```ts
import {
  installFetchWrapper,
  setFetchAuthSource,
  setMasterTokenStorageKey,
  setOidcStorageKey,
  loadAuthConfig,
  getMasterToken,
  getAccessTokenSync,
  tryAuthenticated,
} from "@mosaigo/studio-ui";

setMasterTokenStorageKey("mosapp");  // namespaces `mosapp.master_token`
setOidcStorageKey("mosapp");          // namespaces `mosapp.oidc.*`
installFetchWrapper();
setFetchAuthSource(() => getMasterToken() ?? getAccessTokenSync());

const rt = await loadAuthConfig({ defaultAppName: "mosapp" });
if (rt.enabled && rt.oidc) {
  await tryAuthenticated(rt.oidc);  // non-redirecting; returns false if anonymous
}
```

Once the fetch wrapper is installed, every studio-ui panel's bare
`fetch()` call is transparently authenticated. Panels don't have to
care about tokens.

## Turning auth on

```yaml
# ~/.mosapp/auth.yaml
- kind: mosaigo.KeycloakConfig
  name: default
  enabled: true
  issuer: https://sso.example.com/realms/parkave
  client_id: mosapp
  audience: mosapp
  extra:
    admin_group: mosapp-admins   # optional; default matches the Go-side adminGroup
```

Restart the binary. The SPA's `/api/auth/config` probe now reports
`enabled: true`; the titlebar grows a Sign-in button plus, when a
master-token secret exists, a Master-Token input for break-glass use.
