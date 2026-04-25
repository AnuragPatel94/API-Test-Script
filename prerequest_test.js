/**
 * ============================================
 * 🔥 MASTER PRE-REQUEST SCRIPT (ENTERPRISE LEVEL)
 * ============================================
 * This script includes commonly used real-time
 * pre-request utilities used in companies.
 */

/**
 * ✅ 1. Generate Dynamic Bearer Token (Login API)
 * Purpose: Automatically fetch and store auth token before request
 */
pm.sendRequest({
    url: pm.environment.get("base_url") + "/login",
    method: "POST",
    header: { "Content-Type": "application/json" },
    body: {
        mode: "raw",
        raw: JSON.stringify({
            username: "testuser",
            password: "password123"
        })
    }
}, function (err, res) {
    if (!err) {
        let json = res.json();
        pm.environment.set("token", json.token);
    }
});


/**
 * ✅ 2. Generate Random Email
 * Purpose: Avoid duplicate data errors in create APIs
 */
let email = "user_" + Date.now() + "@gmail.com";
pm.environment.set("email", email);


/**
 * ✅ 3. Dynamic Request Body Builder
 * Purpose: Modify request payload dynamically before sending
 */
let requestBody = {
    name: "User_" + Math.floor(Math.random() * 1000),
    job: "QA Engineer"
};
pm.request.body.raw = JSON.stringify(requestBody);


/**
 * ✅ 4. Generate Unique Request ID / Timestamp
 * Purpose: Used in tracking, logging, idempotency
 */
pm.environment.set("request_id", "REQ_" + Date.now());


/**
 * ✅ 5. HMAC Signature Generation
 * Purpose: Used in secure APIs (banking, payments)
 */
let secret = "mySecretKey";
let payload = pm.request.body.raw || "";
let signature = CryptoJS.HmacSHA256(payload, secret).toString();
pm.environment.set("signature", signature);


/**
 * ✅ 6. Set Authorization Header Dynamically
 * Purpose: Automatically attach token in API request
 */
let token = pm.environment.get("token");
if (token) {
    pm.request.headers.upsert({
        key: "Authorization",
        value: "Bearer " + token
    });
}


/**
 * ✅ 7. Chaining Requests (Use previous API data)
 * Purpose: Pass data between APIs (E2E testing)
 */
let userId = pm.environment.get("user_id");
if (userId) {
    pm.variables.set("userId", userId);
}


/**
 * ✅ 8. Environment Switching (QA / Prod)
 * Purpose: Run same collection across multiple environments
 */
let env = pm.environment.get("env");

if (env === "qa") {
    pm.environment.set("base_url", "https://qa.api.com");
} else if (env === "prod") {
    pm.environment.set("base_url", "https://api.com");
}


/**
 * ✅ 9. Generate Bulk Test Data
 * Purpose: Used in load testing / bulk API validation
 */
let users = [];

for (let i = 0; i < 5; i++) {
    users.push({
        name: "User_" + i,
        email: "user" + i + "@test.com"
    });
}
pm.environment.set("bulkUsers", JSON.stringify(users));


/**
 * ✅ 10. Clean Old Headers
 * Purpose: Prevent flaky tests due to stale headers
 */
pm.request.headers.remove("Authorization");
pm.request.headers.remove("Cookie");


/**
 * ✅ 11. Retry / Token Check Logic
 * Purpose: Handle missing/expired token scenario
 */
if (!pm.environment.get("token")) {
    console.log("⚠️ Token missing. Login API should be triggered.");
}
