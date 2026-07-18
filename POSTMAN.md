Here are the **Postman requests** you can use to test all the new APIs.

> **Base URL**

```
http://localhost:3000
```

---

# 1. Get All Categories

### Method

```
GET
```

### URL

```
http://localhost:3000/api/categories
```

### Headers

```
Content-Type: application/json
```

### Body

```
No Body
```

### Expected Response

```json
[
  {
    "category": "Belts Power Transmission",
    "slug": "belts-power-transmission",
    "productCount": 49,
    "subcategories": [
      {
        "name": "V Belts",
        "slug": "v-belts",
        "productCount": 18
      },
      {
        "name": "Timing Belts",
        "slug": "timing-belts",
        "productCount": 10
      }
    ]
  },
  {
    "category": "Bearings",
    "slug": "bearings",
    "productCount": 16,
    "subcategories": [
      {
        "name": "Radial Ball Bearings",
        "slug": "radial-ball-bearings",
        "productCount": 8
      }
    ]
  }
]
```

---

# 2. Get Products by Category

### Method

```
GET
```

### URL

```
http://localhost:3000/api/products/category/belts-power-transmission
```

### Headers

```
Content-Type: application/json
```

### Body

```
No Body
```

### Expected Response

```json
{
  "category": "Belts Power Transmission",
  "total": 49,
  "products": [
    {
      "_id": "...",
      "name": "XPZ Cogged Belt",
      "category": "Belts Power Transmission",
      "subcategory": "V Belts"
    }
  ]
}
```

---

# 3. Get Products by Category + Subcategory

### Method

```
GET
```

### URL

```
http://localhost:3000/api/products/category/belts-power-transmission/v-belts
```

### Headers

```
Content-Type: application/json
```

### Body

```
No Body
```

### Expected Response

```json
{
  "category": "Belts Power Transmission",
  "subcategory": "V Belts",
  "total": 18,
  "products": [
    {
      "_id": "...",
      "name": "XPZ Cogged Belt",
      "category": "Belts Power Transmission",
      "subcategory": "V Belts"
    }
  ]
}
```

---

# 4. Get Timing Belts

### Method

```
GET
```

### URL

```
http://localhost:3000/api/products/category/belts-power-transmission/timing-belts
```

### Headers

```
Content-Type: application/json
```

### Body

```
No Body
```

---

# 5. Get Bearings

### Method

```
GET
```

### URL

```
http://localhost:3000/api/products/category/bearings
```

### Headers

```
Content-Type: application/json
```

### Body

```
No Body
```

---

# 6. Get Radial Ball Bearings

### Method

```
GET
```

### URL

```
http://localhost:3000/api/products/category/bearings/radial-ball-bearings
```

### Headers

```
Content-Type: application/json
```

### Body

```
No Body
```

---

# 7. Get Thrust Ball Bearings

### Method

```
GET
```

### URL

```
http://localhost:3000/api/products/category/bearings/thrust-ball
```

### Headers

```
Content-Type: application/json
```

### Body

```
No Body
```

---

# 8. Get Radial Roller Bearings

### Method

```
GET
```

### URL

```
http://localhost:3000/api/products/category/bearings/radial-roller
```

### Headers

```
Content-Type: application/json
```

### Body

```
No Body
```

---

# 9. Get Bearing Units

### Method

```
GET
```

### URL

```
http://localhost:3000/api/products/category/bearings/bearing-units
```

### Headers

```
Content-Type: application/json
```

### Body

```
No Body
```

---

# 10. Get Pulleys

### Method

```
GET
```

### URL

```
http://localhost:3000/api/products/category/pulleys
```

### Headers

```
Content-Type: application/json
```

### Body

```
No Body
```

---

# 11. Get Rubber Products

### Method

```
GET
```

### URL

```
http://localhost:3000/api/products/category/rubber
```

### Headers

```
Content-Type: application/json
```

### Body

```
No Body
```

---

# 12. Get Industrial Insulation

### Method

```
GET
```

### URL

```
http://localhost:3000/api/products/category/industrial-insulation
```

### Headers

```
Content-Type: application/json
```

### Body

```
No Body
```

---

# 13. Get Conveying Accessories

### Method

```
GET
```

### URL

```
http://localhost:3000/api/products/category/conveying-accessories
```

### Headers

```
Content-Type: application/json
```

### Body

```
No Body
```

---

# 14. Get Conveying Accessories → Conveying Accessorise

### Method

```
GET
```

### URL

```
http://localhost:3000/api/products/category/conveying-accessories/conveying-accessorise
```

### Headers

```
Content-Type: application/json
```

### Body

```
No Body
```

---

# 15. Get Transmission Chains & Sprockets

### Method

```
GET
```

### URL

```
http://localhost:3000/api/products/category/transmission-chains-and-sprockets
```

### Headers

```
Content-Type: application/json
```

### Body

```
No Body
```

---

# 16. Get Transmission Chain

### Method

```
GET
```

### URL

```
http://localhost:3000/api/products/category/transmission-chains-and-sprockets/transmission-chain
```

### Headers

```
Content-Type: application/json
```

### Body

```
No Body
```

---

# 17. Get Couplings

### Method

```
GET
```

### URL

```
http://localhost:3000/api/products/category/transmission-chains-and-sprockets/couplings
```

### Headers

```
Content-Type: application/json
```

### Body

```
No Body
```

---

# 18. Get Sprockets

### Method

```
GET
```

### URL

```
http://localhost:3000/api/products/category/transmission-chains-and-sprockets/sprockets
```

### Headers

```
Content-Type: application/json
```

### Body

```
No Body
```

---

## Complete API List

| Method | Endpoint                                                                      |
| ------ | ----------------------------------------------------------------------------- |
| GET    | `/api/categories`                                                             |
| GET    | `/api/products/category/belts-power-transmission`                             |
| GET    | `/api/products/category/belts-power-transmission/v-belts`                     |
| GET    | `/api/products/category/belts-power-transmission/timing-belts`                |
| GET    | `/api/products/category/belts-power-transmission/special-belts`               |
| GET    | `/api/products/category/belts-power-transmission/round-belts`                 |
| GET    | `/api/products/category/belts-power-transmission/ribbed-belts`                |
| GET    | `/api/products/category/belts-power-transmission/repair-kits-tension-tools`   |
| GET    | `/api/products/category/bearings`                                             |
| GET    | `/api/products/category/bearings/radial-ball-bearings`                        |
| GET    | `/api/products/category/bearings/radial-roller`                               |
| GET    | `/api/products/category/bearings/thrust-ball`                                 |
| GET    | `/api/products/category/bearings/bearing-units`                               |
| GET    | `/api/products/category/pulleys`                                              |
| GET    | `/api/products/category/rubber`                                               |
| GET    | `/api/products/category/industrial-insulation`                                |
| GET    | `/api/products/category/conveying-accessories`                                |
| GET    | `/api/products/category/conveying-accessories/conveying-accessorise`          |
| GET    | `/api/products/category/transmission-chains-and-sprockets`                    |
| GET    | `/api/products/category/transmission-chains-and-sprockets/transmission-chain` |
| GET    | `/api/products/category/transmission-chains-and-sprockets/couplings`          |
| GET    | `/api/products/category/transmission-chains-and-sprockets/sprockets`          |

These requests require **no request body** and **no authorization headers**, unless you've added authentication middleware to these routes.
