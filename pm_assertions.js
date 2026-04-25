// Parse response once (best practice)
const response = pm.response.json();

/**
 * ✅ 1. Status Code Validation
 * Purpose: Ensure API call is successful
 */
pm.test("Status code should be 200", function () {
    pm.response.to.have.status(200);
});

/**
 * ✅ 2. Status Text Validation
 * Purpose: Validate correct HTTP response message
 */
pm.test("Status text should be OK", function () {
    pm.expect(pm.response.status).to.eql("OK");
});

/**
 * ✅ 3. Response Time Validation
 * Purpose: Ensure API performance is acceptable
 */
pm.test("Response time should be under 2000ms", function () {
    pm.expect(pm.response.responseTime).to.be.below(2000);
});

/**
 * ✅ 4. Content-Type Header Validation
 * Purpose: Verify API returns correct format
 */
pm.test("Content-Type should be application/json", function () {
    pm.expect(pm.response.headers.get("Content-Type")).to.include("application/json");
});

/**
 * ✅ 5. Response Body Type Validation
 * Purpose: Ensure response is JSON object
 */
pm.test("Response body should be an object", function () {
    pm.expect(response).to.be.an("object");
});

/**
 * ✅ 6. Required Root Fields Validation
 * Purpose: Ensure API contract is maintained
 */
pm.test("Response contains all required root fields", function () {
    pm.expect(response).to.have.all.keys(
        "page", "per_page", "total", "total_pages", "data", "support"
    );
});

/**
 * ✅ 7. Pagination Logic Validation
 * Purpose: Ensure pagination values are correct
 */
pm.test("Pagination values should be valid", function () {
    pm.expect(response.page).to.be.a("number").and.to.be.above(0);
    pm.expect(response.per_page).to.be.a("number").and.to.be.above(0);
    pm.expect(response.total).to.be.a("number").and.to.be.at.least(0);
    pm.expect(response.total_pages).to.be.a("number").and.to.be.at.least(0);
});

/**
 * ✅ 8. Data Array Validation
 * Purpose: Ensure users list is valid
 */
pm.test("Data should be a non-empty array", function () {
    pm.expect(response.data).to.be.an("array");
    pm.expect(response.data.length).to.be.at.least(1);
});

/**
 * ✅ 9. Validate Each User Object Structure
 * Purpose: Schema validation at item level
 */
pm.test("Each user should have required fields", function () {
    response.data.forEach(user => {
        pm.expect(user).to.have.all.keys(
            "id", "email", "first_name", "last_name", "avatar"
        );
    });
});

/**
 * ✅ 10. Field Type Validation
 * Purpose: Ensure correct data types
 */
pm.test("User fields should have correct data types", function () {
    response.data.forEach(user => {
        pm.expect(user.id).to.be.a("number");
        pm.expect(user.email).to.be.a("string");
        pm.expect(user.first_name).to.be.a("string");
        pm.expect(user.last_name).to.be.a("string");
        pm.expect(user.avatar).to.be.a("string");
    });
});

/**
 * ✅ 11. Email Format Validation
 * Purpose: Validate business rule (email correctness)
 */
pm.test("Emails should be in valid format", function () {
    response.data.forEach(user => {
        pm.expect(user.email).to.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
    });
});

/**
 * ✅ 12. Name Field Validation
 * Purpose: Ensure no empty names
 */
pm.test("First and Last names should not be empty", function () {
    response.data.forEach(user => {
        pm.expect(user.first_name.length).to.be.above(0);
        pm.expect(user.last_name.length).to.be.above(0);
    });
});

/**
 * ✅ 13. Avatar URL Validation
 * Purpose: Ensure valid image URL
 */
pm.test("Avatar should be a valid URL", function () {
    response.data.forEach(user => {
        pm.expect(user.avatar).to.match(/^https?:\/\/.+/);
    });
});

/**
 * ✅ 14. Support Object Validation
 * Purpose: Validate additional API info
 */
pm.test("Support object should have required fields", function () {
    pm.expect(response.support).to.have.all.keys("url", "text");
});

/**
 * ✅ 15. Support URL Validation
 * Purpose: Ensure valid support link
 */
pm.test("Support URL should be valid", function () {
    pm.expect(response.support.url).to.match(/^https?:\/\/.+/);
});

/**
 * ✅ 16. Edge Case - Empty Data Handling
 * Purpose: Handle cases when no users returned
 */
pm.test("If total is 0, data array should be empty", function () {
    if (response.total === 0) {
        pm.expect(response.data.length).to.eql(0);
    }
});

/**
 * ✅ 17. Edge Case - Data Count vs Per Page
 * Purpose: Validate pagination logic
 */
pm.test("Data length should not exceed per_page limit", function () {
    pm.expect(response.data.length).to.be.at.most(response.per_page);
});

/**
 * ✅ 18. Schema Validation (TV4)
 * Purpose: Full contract validation
 */
pm.test("Schema validation should pass", function () {
    const schema = {
        type: "object",
        required: ["page", "per_page", "total", "total_pages", "data", "support"],
        properties: {
            page: { type: "number" },
            per_page: { type: "number" },
            total: { type: "number" },
            total_pages: { type: "number" },
            data: {
                type: "array",
                items: {
                    type: "object",
                    required: ["id", "email", "first_name", "last_name", "avatar"],
                    properties: {
                        id: { type: "number" },
                        email: { type: "string" },
                        first_name: { type: "string" },
                        last_name: { type: "string" },
                        avatar: { type: "string" }
                    }
                }
            },
            support: {
                type: "object",
                required: ["url", "text"],
                properties: {
                    url: { type: "string" },
                    text: { type: "string" }
                }
            }
        }
    };

    pm.expect(tv4.validate(response, schema)).to.be.true;
});
