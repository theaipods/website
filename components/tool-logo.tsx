const logos: Record<string, string> = {
  "GitHub Copilot": "githubcopilot.svg", "Microsoft Teams": "microsoftteams.svg", "Google BigQuery": "googlebigquery.svg",
  "LangChain": "langchain.svg", "n8n": "n8n.svg", "Slack": "slack.svg", "Google Drive": "googledrive.svg",
  "Gmail": "gmail.svg", "Google Calendar": "googlecalendar.svg", "Notion": "notion.svg", "GitHub": "github.svg",
  "Jira": "jira.svg", "HubSpot": "hubspot.svg", "Salesforce": "salesforce.svg", "Google Sheets": "googlesheets.svg",
  "Shopify": "shopify.svg", "Zendesk": "zendesk.svg", "QuickBooks": "quickbooks.svg", "Figma": "figma.svg",
  "Airtable": "airtable.svg", "Dropbox": "dropbox.svg", "Linear": "linear.svg", "Asana": "asana.svg",
  "Stripe": "stripe.svg", "Zoom": "zoom.svg", "Canva": "canva.svg", "Intercom": "intercom.svg",
  "Microsoft Power BI": "powerbi.svg", "Mailchimp": "mailchimp.svg", "Calendly": "calendly.svg", "Google Analytics": "googleanalytics.svg",
  "WordPress": "wordpress.svg", "Instagram": "instagram.svg", "WhatsApp": "whatsapp.svg",
};

export function ToolLogo({ name, size = 24 }: { name: string; size?: number }) {
  const file = logos[name];
  return file ? <img src={`/tool-icons/${file}`} width={size} height={size} alt="" loading="lazy" aria-hidden="true" /> : null;
}
