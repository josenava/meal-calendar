# meal-calendar
Calendar to track weekly meals during the year.

# API

## auth
```
POST  -H "API_VERSION: v1" /signup
{
    "email": "foo@bar.com",
    "password": "hiddenPassw0rd!"
}
```

```
POST -H "API_VERSION: v1" /api/auth
{
    "email": "foo@bar.com",
    "password": "hiddenPassw0rd!",
}

returns
{
    "bearer": "JWT 3925ukasjfhad"
}
```

## meals
```
GET -H "API_VERSION: v1" -H "Authorization: JWT 3925ukasjfhad" /api/meals?start_date="2020-07-20"&end_date="2020-07-27"

returns

{
    "meals": [
        {
            "date": "2020-07-20",
            "type": "breakfast",
            "title": "cereals",
            "toppings": ["milk", "cereals", "bread"]
        },
        {
            "date": "2020-07-20",
            "type": "lunch",
            "title": "pizza",
            "toppings": ["cheese", "tomato", "bread"]
        },
        {
            "date": "2020-07-20",
            "type": "dinner",
            "title": "salad",
            "toppings": ["lettuce", "tomato", "olives"]
        },
    ]
}
```

```
POST -H "API_VERSION: v1" -H "Authorization: JWT 3925ukasjfhad" /meals
{
    "date": "2020-07-20",
    "type": "breakfast",
    "title": "cereals",
    "toppings": ["milk", "cereals", "bread"]
    "categories": [1, 2]
}

returns 201
```
