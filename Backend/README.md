# Users API — Register Endpoint

## Endpoint
POST /users/register

(Assumes the router is mounted at `/users`, e.g. `app.use('/users', userRoutes)`.)

## Description
Register a new user. The endpoint accepts a JSON body containing the user's full name (split into first and last), email, and password. If the data passes validation, a new user is created, a JWT auth token is returned and the created user object is included in the response.

## Headers
- Content-Type: application/json

## Request Body
JSON object with the following shape:

```json
{
  "fullname": {
    "firstname": "string",   
    "lastname": "string"
  },
  "email": "user@example.com",
  "password": "password123"
}
```

All fields are required.

### Field validation rules (from model/controller)
- `fullname.firstname`: string, required, minimum length 3
- `fullname.lastname`: string, required, minimum length 3
- `email`: string, required, minimum length 5, must be unique
- `password`: string, required, minimum length 6

If validation fails the endpoint returns status 400 with the validation details.

## Responses

- 201 Created
  - Description: User successfully created. Returns an auth token and the created user object.
  - Example body:

Example HTTP response (success):

```http
HTTP/1.1 201 Created
Content-Type: application/json; charset=utf-8

{
  "token": "<jwt-token>",
  "user": {
    "_id": "642...",
    "fullname": {
      "firstname": "Jane",
      "lastname": "Doe"
    },
    "email": "jane.doe@example.com",
    "soketId": null
    /* password is not returned (select:false on model) */
  }
}
```

- 400 Bad Request
  - Description: Validation failed (missing/invalid fields). The response contains an `errors` array with details from `express-validator`.
  - Example body:

Example HTTP response (validation failure):

```http
HTTP/1.1 400 Bad Request
Content-Type: application/json; charset=utf-8

{
  "errors": [
    {
      "msg": "Firstname must be at least 3 characters long",
      "param": "fullname.firstname",
      "location": "body"
    }
  ]
}
```

- 409 Conflict (possible)
  - Description: Email already exists (model enforces unique email). The current implementation may return a 500 depending on error handling, but 409 is the appropriate semantic status.
  - Example body:

```json
{
  "error": "Email already in use"
}
```

- 500 Internal Server Error
  - Description: Unexpected server error while creating user or generating token.
  - Example body:

```json
{
  "error": "Internal server error"
}
```

## Login Endpoint

POST /users/login

Authenticate an existing user and receive a JSON Web Token (JWT) for authenticated requests.

### Headers
- Content-Type: application/json

### Request Body
JSON object with the following shape:

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

Both fields are required. Current route validation enforces:
- `email` must be a valid email address
- `password` must be at least 6 characters long

### Responses

- 200 OK
  - Description: Successful authentication. Returns an auth token and the user object.
  - Example HTTP response (success):

```http
HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8

{
  "token": "<jwt-token>",
  "user": {
    "_id": "642...",
    "fullname": { "firstname": "Jane", "lastname": "Doe" },
    "email": "jane.doe@example.com",
    "soketId": null
    /* Recommended: do NOT return the password field in responses */
  }
}
```

- 400 Bad Request
  - Description: Validation failed (invalid email format or password too short).
  - Example HTTP response (validation failure):

```http
HTTP/1.1 400 Bad Request
Content-Type: application/json; charset=utf-8

{
  "errors": [
    { "msg": "Please provide a valid email", "param": "email", "location": "body" }
  ]
}
```

- 401 Unauthorized
  - Description: Authentication failed (invalid email or password).
  - Example body:

```json
{
  "message": "Invalid email or password"
}
```

- 500 Internal Server Error
  - Description: Unexpected server error.

### Notes
- The current controller implementation queries the user and includes the password field for verification; ensure the returned `user` in the response does not include the password (remove or omit `password` before returning).
- Use the returned token in the `Authorization` header as: `Authorization: Bearer <jwt-token>` for protected routes.

## Profile Endpoint

GET /users/profile

Returns the currently authenticated user's profile. This route is protected and requires a valid JWT. The project stores the token either in a `token` cookie or is sent using the `Authorization: Bearer <jwt>` header.

### Headers
- Authorization: Bearer <jwt-token>   OR   Cookie: token=<jwt-token>

### Request
- No request body.

### Responses

- 200 OK
  - Description: Returns the authenticated user's profile.
  - Example HTTP response:

```http
HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8

{
  "user": {
    "_id": "642...",
    "fullname": { "firstname": "Jane", "lastname": "Doe" },
    "email": "jane.doe@example.com",
    "soketId": null
  }
}
```

- 401 Unauthorized
  - Description: Missing or invalid token.
  - Example body:

```json
{
  "message": "Access denied. No token provided."
}
```

- 500 Internal Server Error
  - Description: Unexpected server error.

## Logout Endpoint

POST /users/logout

Logs out the current user by blacklisting the JWT (server-side) and clearing the `token` cookie. No body required.

### Headers
- Authorization: Bearer <jwt-token>   OR   Cookie: token=<jwt-token>

### Request
- No request body.

### Responses

- 200 OK
  - Description: User successfully logged out; cookie cleared and token blacklisted.
  - Example body:

```json
{
  "message": "Logged out successfully"
}
```

- 401 Unauthorized
  - Description: Missing or invalid token.

- 500 Internal Server Error
  - Description: Unexpected server error while blacklisting token or clearing cookie.

### Notes
- The implementation depends on a `blacklistToken` service to persist invalidated tokens; ensure that service exists and is resilient (e.g., stores token expiry).
- Clearing the cookie uses `res.clearCookie('token')` — confirm cookie options (path, domain, secure, httpOnly) are consistent across login/logout flows.

## Captain Routes

### Register Captain

POST /captain/register

Register a new captain (driver) with vehicle details. The route applies validation on the body (see `routes/captain.routes.js`) and returns the created captain and an auth token on success.

#### Headers
- Content-Type: application/json

#### Request Body
JSON object with the following shape:

```json
{
  "fullname": { "firstname": "string", "lastname": "string" },
  "email": "captain@example.com",
  "password": "password123",
  "phoneNumber": "+1234567890",
  "vehicle": {
    "vehicleType": "car|bike|auto",
    "number": "vehicle-registration-number",
    "capacity": 4,
    "color": "optional-string"
  }
}
```

All fields listed above are expected by the service; the route validators in `captain.routes.js` require at minimum:
- `fullname.firstname`: min length 3
- `email`: valid email
- `password`: min length 6
- `vehicle.capacity`: positive integer
- `vehicle.vehicleType`: one of `car`, `bike`, `auto`
- `vehicle.number`: non-empty string

If any validation fails the route returns 400 with the `errors` array from `express-validator`.

#### Responses

- 201 Created
  - Description: Captain created successfully. Returns an auth token and the captain object.
  - Example HTTP response:

```http
HTTP/1.1 201 Created
Content-Type: application/json; charset=utf-8

{
  "token": "<jwt-token>",
  "captain": {
    "_id": "642...",
    "fullname": { "firstname": "John", "lastname": "Driver" },
    "email": "captain@example.com",
    "phoneNumber": "+1234567890",
    "vehicle": { "vehicleType": "car", "number": "XYZ-1234", "capacity": 4, "color": "white" }
  }
}
```

- 400 Bad Request
  - Description: Validation failed. Example response:

```http
HTTP/1.1 400 Bad Request
Content-Type: application/json; charset=utf-8

{
  "errors": [ { "msg": "Vehicle capacity must be a positive integer", "param": "vehicle.capacity", "location": "body" } ]
}
```

- 409 Conflict
  - Description: Email already in use (or other uniqueness constraint).

- 500 Internal Server Error
  - Description: Unexpected error while creating the captain or saving vehicle info.

#### Notes & TODO
- The current `captain.routes.js` references `user.controller`/`userController.registerCaptain` — ensure a dedicated captain controller exists or export a `registerCaptain` function from the appropriate controller.
- The `captain.service.createCaptain` should return the created document and handle hashing the password before saving (similar to `user` flow).
- Add explicit validation middleware and error handling to return consistent status codes (409 for duplicates, 400 for validation, 500 for server errors).

## Notes and implementation details
- The controller hashes the password before creating the user and generates a JWT using `process.env.JWT_SECRET`.
- The model marks the password field `select:false`, so the password should not be returned in responses.
- Make sure `Content-Type: application/json` header is sent.
- Example minimal curl request body (JSON body only):

```json
{
  "fullname": {"firstname": "Jane", "lastname": "Doe"},
  "email": "jane.doe@example.com",
  "password": "securePassword1"
}
```

## TODO / Recommendations
- Ensure the route is mounted at `/users` in your main app (e.g., `app.use('/users', require('./routes/user.routes'))`).
- Add explicit error handling in the controller/service to return 409 on duplicate emails and 500 with structured error messages on other failures.
- Add/adjust express-validator rules on the route to enforce the schema and return helpful messages.


---

File created: `Backend/README.md` — documents the POST `/users/register` endpoint, request format, validation, and sample responses.






