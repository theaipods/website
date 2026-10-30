# Homepage contact notifications

The homepage interest form sends its notification from the server with the Resend API. It does not expose the provider key in browser code or store submitted addresses in the application database.

Set these variables in the website's server environment:

- `RESEND_API_KEY`: a Resend API key with permission to send mail.
- `RESEND_FROM`: a sender address on a domain verified in Resend, such as `TheAI Pods <website@theaipods.com>` if that address/domain is verified.
- `CONTACT_LEADS_TO`: optional notification inbox; defaults to `contact@theaipods.com`.

When a visitor submits their email, the server sends a notification to the configured inbox and sets the visitor's email as Reply-To. The site rate-limits repeated submissions and returns a truthful error if configuration or delivery fails. Keep API keys in local server environment files and deployment secret settings; never add them to `NEXT_PUBLIC_*` variables, source control, or browser code. After configuring Railway, redeploy or restart the website service and submit one real test request to confirm inbox delivery and Reply-To.
