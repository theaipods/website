export const integrations: Record<string, string[]> = {
  Communication: ['Slack', 'Microsoft Teams', 'Gmail', 'Google Calendar', 'Zoom', 'Discord', 'Telegram'],
  Product: ['Jira', 'Linear', 'Figma', 'Asana', 'Trello', 'ClickUp', 'Miro'],
  Engineering: ['GitHub', 'GitLab', 'Bitbucket', 'AWS', 'Vercel', 'Docker', 'Jenkins', 'Sentry', 'Datadog', 'Cloudflare'],
  Marketing: ['HubSpot', 'Google Analytics', 'Google Ads', 'Meta', 'LinkedIn Ads', 'Mailchimp', 'Brevo', 'Buffer', 'Semrush', 'Canva'],
  Knowledge: ['Notion', 'Google Drive', 'Confluence', 'Dropbox', 'Box', 'Airtable', 'Obsidian'],
  Sales: ['Salesforce', 'Pipedrive', 'Zoho', 'Calendly'],
  Analytics: ['Mixpanel', 'Power BI', 'Tableau', 'Amplitude', 'Looker', 'Metabase', 'Snowflake', 'Google BigQuery'],
  People: ['Greenhouse', 'BambooHR', 'Workday', 'Deel'],
  Finance: ['QuickBooks', 'NetSuite', 'Stripe', 'Xero', 'Razorpay', 'PayPal'],
  Support: ['Zendesk', 'Intercom', 'Freshdesk', 'Help Scout'],
  Commerce: ['Shopify', 'WooCommerce', 'Magento', 'BigCommerce', 'Square'],
};
export const toolSlug = (name: string) => name.toLowerCase().replace(/[^a-z0-9]/g, '');
