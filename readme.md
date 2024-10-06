# Rajan Store Backend

## Auth

### Signup

**Method**: POST  
**URL**: `{{baseUrl}}{{authurl}}/signup`

#### Body (raw)

```json
{
  "name": "dummy4",
  "email": "dummy133@example.com",
  "password": "password123"
}
```

---

### Login

**Method**: POST  
**URL**: `{{baseUrl}}{{authurl}}/login`

#### Body (raw)

```json
{
  "email": "dummy133@example.com",
  "password": "password123"
}
```

#### Tests

```javascript
let responseData = pm.response.json();
pm.environment.set("accessToken", responseData.data.accessToken);
pm.environment.set("refreshToken", responseData.data.refreshToken);
```

---

### Forgot Password

**Method**: POST  
**URL**: `{{baseUrl}}{{authurl}}/forgot-password`

#### Body (raw)

```json
{
  "email": "john@example.com"
}
```

#### Tests

```javascript
let responseData = pm.response.json();
pm.environment.set("resetLink", responseData.data);
const resetToken = responseData.data.split("/").pop();
pm.environment.set("resetToken", resetToken);
pm.test("Reset link sent successfully", function () {
  pm.response.to.have.status(200);
});
```

---

### Reset Password

**Method**: POST  
**URL**: `{{baseUrl}}{{authurl}}/reset-password/{{resetToken}}`

#### Body (raw)

```json
{
  "password": "newPassword"
}
```

---

### Logout

**Method**: POST  
**URL**: `{{baseUrl}}{{authurl}}/logout`

#### Tests

```javascript
pm.environment.unset("accessToken");
pm.environment.unset("refreshToken");
pm.test("Logged out successfully", function () {
  pm.response.to.have.status(200);
});
```

---

### Refresh Token

**Method**: POST  
**URL**: `{{baseUrl}}{{authurl}}/refresh-token`

#### Tests

```javascript
let responseData = pm.response.json();
if (responseData && responseData.data) {
  if (responseData.data.accessToken) {
    pm.environment.set("accessToken", responseData.data.accessToken);
  }
  if (responseData.data.refreshToken) {
    pm.environment.set("refreshToken", responseData.data.refreshToken);
  }
}
```

---

## Products

### Get Products

**Method**: GET  
**URL**: `{{baseUrl}}{{productsurl}}`

---

### Get Specific Product

**Method**: GET  
**URL**: `{{baseUrl}}{{productsurl}}/:productId`

---

## Cart

### Get Cart

**Method**: GET  
**URL**: `{{baseUrl}}{{carturl}}`  
**Authorization**: Bearer `{{accessToken}}`

---

### Add to Cart

**Method**: POST  
**URL**: `{{baseUrl}}{{carturl}}/items`  
**Authorization**: Bearer `{{accessToken}}`

#### Body (raw)

```json
{}
```

---

### Update Cart Item

**Method**: PUT  
**URL**: `{{baseUrl}}{{carturl}}/items/:itemId`  
**Authorization**: Bearer `{{accessToken}}`

---

### Delete Cart Item

**Method**: DELETE  
**URL**: `{{baseUrl}}{{carturl}}/items/:itemId`  
**Authorization**: Bearer `{{accessToken}}`

---

### Delete/Clear Cart

**Method**: DELETE  
**URL**: `{{baseUrl}}{{carturl}}`  
**Authorization**: Bearer `{{accessToken}}`

---

## Orders

### Get User Orders

**Method**: GET  
**Authorization**: Bearer `{{accessToken}}`

---

### Create Order

**Method**: POST  
**Authorization**: Bearer `{{accessToken}}`

---

### Cancel Order

**Method**: DELETE  
**Authorization**: Bearer `{{accessToken}}`

---

## Users

### Get User

**Method**: GET  
**URL**: `{{baseUrl}}{{usersurl}}/me`  
**Authorization**: Bearer `{{accessToken}}`

---

### Update User

**Method**: PATCH  
**URL**: `{{baseUrl}}{{usersurl}}/me`  
**Authorization**: Bearer `{{accessToken}}`

#### Body (raw)

```json
{
  "name": "john_updated",
  "email": "john_updated@example.com"
}
```

---

### Delete User

**Method**: DELETE  
**URL**: `{{baseUrl}}{{usersurl}}/me`  
**Authorization**: Bearer `{{accessToken}}`

---

## Admin

### Get All Users

**Method**: GET

---

### Create Product

**Method**: POST

---

## Checkout/Payment

### Get Payment Status

**Method**: GET  
**URL**: `{{basicurl}}/payment/status`  
**Authorization**: Bearer `{{accessToken}}`

---

### Initiate Checkout

**Method**: POST  
**URL**: `{{basicurl}}/checkout/initiate`  
**Authorization**: Bearer `{{accessToken}}`
