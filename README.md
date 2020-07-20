# meal-calendar
Calendar to track weekly meals during the year.

# API

## auth
```
POST /signup
{
    "email": "foo@bar.com",
    "password": "hiddenPassw0rd!"
}
```

```
POST /api/auth
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
GET -H "Authorization: JWT 3925ukasjfhad" /api/meals?start_date="2020-07-20"&end_date="2020-07-27"

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
POST -H "Authorization: JWT 3925ukasjfhad" /meals
{
    "date": "2020-07-20",
    "type": "breakfast",
    "title": "cereals",
    "toppings": ["milk", "cereals", "bread"]
    "categories": [1, 2]
}

returns 201
```


## Project structure
TBD

## Alembic
```
cd server
make cmd cmd="bash"
alembic upgrade head
```


# python tests
```
cd server
make tests
```
