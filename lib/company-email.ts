// Shared UI/API policy. Domain filtering plus mailbox verification does not prove employment.
const personalDomains = new Set([
  "gmail.com", "googlemail.com", "yahoo.com", "yahoo.co.in", "yahoo.co.uk", "ymail.com", "rocketmail.com",
  "hotmail.com", "hotmail.co.uk", "outlook.com", "outlook.in", "live.com", "live.in", "msn.com",
  "aol.com", "icloud.com", "me.com", "mac.com", "proton.me", "protonmail.com", "pm.me", "tutanota.com",
  "tuta.com", "mail.com", "email.com", "gmx.com", "gmx.de", "gmx.net", "zoho.com", "zohomail.com",
  "rediffmail.com", "rediff.com", "yandex.com", "yandex.ru", "qq.com", "163.com", "126.com",
  "mailinator.com", "guerrillamail.com", "yopmail.com", "tempmail.com", "10minutemail.com", "dispostable.com",
]);
export function isCompanyEmail(email: string, extraBlocked: string[] = []) {
  if (!/^[^\s@]+@[^\s@]+$/.test(email.trim()) || email.length > 254) return false;
  const domain = email.trim().toLowerCase().split("@")[1];
  if (!domain || !/^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]*[a-z0-9])?)+$/.test(domain)) return false;
  return ![...personalDomains, ...extraBlocked.map(x => x.trim().toLowerCase()).filter(Boolean)]
    .some(blocked => domain === blocked || domain.endsWith(`.${blocked}`));
}
export const companyEmailMessage = "Use your company email address. Personal and disposable email accounts are not eligible for workspace access.";
