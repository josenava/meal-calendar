"""
Tests for the meals API endpoints.
"""


class TestHealthEndpoint:
    """Tests for the health check endpoint."""

    def test_health_check(self, client):
        """Test that health endpoint returns healthy status."""
        response = client.get("/api/health")
        assert response.status_code == 200
        assert response.json() == {"status": "healthy"}


class TestGetMeals:
    """Tests for GET /api/meals endpoint."""

    def test_get_meals_empty(self, client):
        """Test getting meals when database is empty."""
        response = client.get("/api/meals?start_date=2024-01-15&end_date=2024-01-21")
        assert response.status_code == 200
        assert response.json() == []

    def test_get_meals_within_range(self, client, sample_meals):
        """Test getting meals within a date range."""
        response = client.get("/api/meals?start_date=2024-01-15&end_date=2024-01-16")
        assert response.status_code == 200
        
        meals = response.json()
        assert len(meals) == 5  # 3 meals on 15th + 2 meals on 16th
        
        # Check ordering by date
        dates = [m["date"] for m in meals]
        assert dates == sorted(dates)

    def test_get_meals_single_day(self, client, sample_meals):
        """Test getting meals for a single day."""
        response = client.get("/api/meals?start_date=2024-01-15&end_date=2024-01-15")
        assert response.status_code == 200
        
        meals = response.json()
        assert len(meals) == 3
        for meal in meals:
            assert meal["date"] == "2024-01-15"

    def test_get_meals_outside_range(self, client, sample_meals):
        """Test getting meals outside the data range returns empty."""
        response = client.get("/api/meals?start_date=2024-02-01&end_date=2024-02-07")
        assert response.status_code == 200
        assert response.json() == []

    def test_get_meals_missing_params(self, client):
        """Test that missing query parameters returns 422."""
        response = client.get("/api/meals")
        assert response.status_code == 422

    def test_get_meals_invalid_date_format(self, client):
        """Test that invalid date format returns 422."""
        response = client.get("/api/meals?start_date=invalid&end_date=2024-01-21")
        assert response.status_code == 422


class TestCreateMeal:
    """Tests for POST /api/meals endpoint."""

    def test_create_meal_success(self, client, sample_meal_data):
        """Test creating a new meal successfully."""
        response = client.post("/api/meals", json=sample_meal_data)
        
        assert response.status_code == 201
        data = response.json()
        assert data["name"] == sample_meal_data["name"]
        assert data["date"] == sample_meal_data["date"]
        assert data["meal_type"] == sample_meal_data["meal_type"]
        assert "id" in data

    def test_create_meal_all_types(self, client):
        """Test creating meals with all valid meal types."""
        for meal_type in ["breakfast", "lunch", "dinner"]:
            response = client.post("/api/meals", json={
                "date": f"2024-01-2{['breakfast', 'lunch', 'dinner'].index(meal_type)}",
                "meal_type": meal_type,
                "name": f"Test {meal_type}"
            })
            assert response.status_code == 201
            assert response.json()["meal_type"] == meal_type

    def test_create_meal_duplicate_fails(self, client, sample_meal_data):
        """Test that creating a duplicate meal (same date/type) fails."""
        # Create first meal
        response1 = client.post("/api/meals", json=sample_meal_data)
        assert response1.status_code == 201
        
        # Try to create duplicate
        response2 = client.post("/api/meals", json=sample_meal_data)
        assert response2.status_code == 409
        assert "already exists" in response2.json()["detail"]

    def test_create_meal_empty_name_fails(self, client):
        """Test that creating a meal with empty name fails."""
        response = client.post("/api/meals", json={
            "date": "2024-01-15",
            "meal_type": "breakfast",
            "name": ""
        })
        assert response.status_code == 422

    def test_create_meal_whitespace_name_fails(self, client):
        """Test that creating a meal with whitespace-only name fails."""
        response = client.post("/api/meals", json={
            "date": "2024-01-15",
            "meal_type": "breakfast",
            "name": "   "
        })
        assert response.status_code == 422

    def test_create_meal_invalid_meal_type_fails(self, client):
        """Test that creating a meal with invalid type fails."""
        response = client.post("/api/meals", json={
            "date": "2024-01-15",
            "meal_type": "brunch",  # Invalid
            "name": "Test meal"
        })
        assert response.status_code == 422

    def test_create_meal_strips_name_whitespace(self, client):
        """Test that meal name whitespace is stripped."""
        response = client.post("/api/meals", json={
            "date": "2024-01-15",
            "meal_type": "breakfast",
            "name": "  Pancakes  "
        })
        assert response.status_code == 201
        assert response.json()["name"] == "Pancakes"

    def test_create_meal_with_ingredients(self, client):
        """Test creating a meal with ingredients."""
        response = client.post("/api/meals", json={
            "date": "2024-01-15",
            "meal_type": "breakfast",
            "name": "Pancakes",
            "ingredients": ["flour", "eggs", "milk"]
        })
        assert response.status_code == 201
        data = response.json()
        assert data["ingredients"] == ["flour", "eggs", "milk"]

    def test_create_meal_without_ingredients(self, client):
        """Test creating a meal without ingredients returns empty list."""
        response = client.post("/api/meals", json={
            "date": "2024-01-15",
            "meal_type": "breakfast",
            "name": "Pancakes"
        })
        assert response.status_code == 201
        assert response.json()["ingredients"] == []

    def test_create_meal_ingredients_strips_whitespace(self, client):
        """Test that ingredient whitespace is stripped."""
        response = client.post("/api/meals", json={
            "date": "2024-01-15",
            "meal_type": "breakfast",
            "name": "Pancakes",
            "ingredients": ["  flour  ", "eggs"]
        })
        assert response.status_code == 201
        assert response.json()["ingredients"] == ["flour", "eggs"]

    def test_create_meal_too_many_ingredients_fails(self, client):
        """Test that exceeding max ingredients fails."""
        response = client.post("/api/meals", json={
            "date": "2024-01-15",
            "meal_type": "breakfast",
            "name": "Pancakes",
            "ingredients": [f"ingredient{i}" for i in range(11)]
        })
        assert response.status_code == 422


class TestUpdateMeal:
    """Tests for PUT /api/meals/{meal_id} endpoint."""

    def test_update_meal_success(self, client, sample_meal):
        """Test updating an existing meal."""
        response = client.put(
            f"/api/meals/{sample_meal.id}",
            json={
                "date": str(sample_meal.date),
                "meal_type": sample_meal.meal_type,
                "name": "Updated Pancakes"
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == sample_meal.id
        assert data["name"] == "Updated Pancakes"
        assert data["date"] == str(sample_meal.date)
        assert data["meal_type"] == sample_meal.meal_type

    def test_update_meal_not_found(self, client):
        """Test updating a non-existent meal returns 404."""
        response = client.put(
            "/api/meals/99999",
            json={
                "date": "2024-01-15",
                "meal_type": "breakfast",
                "name": "New name"
            }
        )
        assert response.status_code == 404
        assert response.json()["detail"] == "Meal not found"

    def test_update_meal_empty_name_fails(self, client, sample_meal):
        """Test that updating with empty name fails."""
        response = client.put(
            f"/api/meals/{sample_meal.id}",
            json={
                "date": str(sample_meal.date),
                "meal_type": sample_meal.meal_type,
                "name": ""
            }
        )
        assert response.status_code == 422

    def test_update_meal_strips_whitespace(self, client, sample_meal):
        """Test that updated meal name whitespace is stripped."""
        response = client.put(
            f"/api/meals/{sample_meal.id}",
            json={
                "date": str(sample_meal.date),
                "meal_type": sample_meal.meal_type,
                "name": "  Waffles  "
            }
        )
        assert response.status_code == 200
        assert response.json()["name"] == "Waffles"

    def test_update_meal_with_ingredients(self, client, sample_meal):
        """Test updating a meal with ingredients."""
        response = client.put(
            f"/api/meals/{sample_meal.id}",
            json={
                "date": str(sample_meal.date),
                "meal_type": sample_meal.meal_type,
                "name": "Waffles",
                "ingredients": ["flour", "eggs"]
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == "Waffles"
        assert data["ingredients"] == ["flour", "eggs"]

    def test_update_meal_replaces_ingredients(self, client):
        """Test that updating ingredients replaces the list."""
        # First create a meal with ingredients
        create_response = client.post("/api/meals", json={
            "date": "2024-01-18",
            "meal_type": "breakfast",
            "name": "Pancakes",
            "ingredients": ["flour", "eggs"]
        })
        meal_id = create_response.json()["id"]
        
        # Update with new ingredients
        update_response = client.put(
            f"/api/meals/{meal_id}",
            json={
                "date": "2024-01-18",
                "meal_type": "breakfast",
                "name": "Pancakes",
                "ingredients": ["maple syrup"]
            }
        )
        assert update_response.status_code == 200
        assert update_response.json()["ingredients"] == ["maple syrup"]

    def test_update_meal_type_success(self, client, sample_meal):
        """Test updating a meal's type."""
        response = client.put(
            f"/api/meals/{sample_meal.id}",
            json={
                "date": str(sample_meal.date),
                "meal_type": "dinner",
                "name": sample_meal.name,
                "ingredients": sample_meal.ingredients or []
            }
        )
        assert response.status_code == 200
        assert response.json()["meal_type"] == "dinner"


class TestDeleteMeal:
    """Tests for DELETE /api/meals/{meal_id} endpoint."""

    def test_delete_meal_success(self, client, sample_meal):
        """Test deleting an existing meal."""
        response = client.delete(f"/api/meals/{sample_meal.id}")
        assert response.status_code == 204
        
        # Verify meal is deleted
        get_response = client.get("/api/meals?start_date=2024-01-15&end_date=2024-01-15")
        assert len(get_response.json()) == 0

    def test_delete_meal_not_found(self, client):
        """Test deleting a non-existent meal returns 404."""
        response = client.delete("/api/meals/99999")
        assert response.status_code == 404
        assert response.json()["detail"] == "Meal not found"

    def test_delete_meal_idempotent_fails(self, client, sample_meal):
        """Test that deleting the same meal twice fails on second attempt."""
        # First delete succeeds
        response1 = client.delete(f"/api/meals/{sample_meal.id}")
        assert response1.status_code == 204
        
        # Second delete fails
        response2 = client.delete(f"/api/meals/{sample_meal.id}")
        assert response2.status_code == 404


class TestCopyMeal:
    """Tests for POST /api/meals/{meal_id}/copy endpoint."""

    def test_copy_meal_success(self, client, sample_meal):
        """Test copying a meal to a different date."""
        response = client.post(
            f"/api/meals/{sample_meal.id}/copy",
            json={"target_date": "2024-01-20", "target_meal_type": "dinner"}
        )
        
        assert response.status_code == 201
        data = response.json()
        assert data["name"] == sample_meal.name
        assert data["date"] == "2024-01-20"
        assert data["meal_type"] == "dinner"
        assert data["id"] != sample_meal.id

    def test_copy_meal_same_date_different_type(self, client, sample_meal):
        """Test copying a meal to the same date but different type."""
        response = client.post(
            f"/api/meals/{sample_meal.id}/copy",
            json={"target_date": "2024-01-15", "target_meal_type": "dinner"}
        )
        
        assert response.status_code == 201
        assert response.json()["meal_type"] == "dinner"

    def test_copy_meal_source_not_found(self, client):
        """Test copying a non-existent meal returns 404."""
        response = client.post(
            "/api/meals/99999/copy",
            json={"target_date": "2024-01-20", "target_meal_type": "dinner"}
        )
        assert response.status_code == 404
        assert "Source meal not found" in response.json()["detail"]

    def test_copy_meal_duplicate_target_fails(self, client, sample_meals):
        """Test copying to an existing date/type combination fails."""
        # sample_meals has breakfast on 2024-01-15
        meal_id = sample_meals[0].id
        
        response = client.post(
            f"/api/meals/{meal_id}/copy",
            json={"target_date": "2024-01-15", "target_meal_type": "lunch"}  # Already exists
        )
        
        assert response.status_code == 409
        assert "already exists" in response.json()["detail"]

    def test_copy_meal_invalid_meal_type_fails(self, client, sample_meal):
        """Test copying with invalid meal type fails."""
        response = client.post(
            f"/api/meals/{sample_meal.id}/copy",
            json={"target_date": "2024-01-20", "target_meal_type": "snack"}
        )
        assert response.status_code == 422

    def test_copy_meal_copies_ingredients(self, client):
        """Test that copying a meal also copies ingredients."""
        # Create a meal with ingredients
        create_response = client.post("/api/meals", json={
            "date": "2024-01-19",
            "meal_type": "breakfast",
            "name": "Pancakes",
            "ingredients": ["flour", "eggs", "milk"]
        })
        meal_id = create_response.json()["id"]
        
        # Copy the meal
        copy_response = client.post(
            f"/api/meals/{meal_id}/copy",
            json={"target_date": "2024-01-20", "target_meal_type": "dinner"}
        )
        assert copy_response.status_code == 201
        data = copy_response.json()
        assert data["name"] == "Pancakes"
        assert data["ingredients"] == ["flour", "eggs", "milk"]
        assert data["date"] == "2024-01-20"
        assert data["meal_type"] == "dinner"


class TestSearchMeals:
    """Tests for GET /api/meals/search endpoint."""

    def test_search_meals_by_ingredient(self, client):
        """Test searching meals by ingredient returns matching meals."""
        # Create meals with ingredients
        client.post("/api/meals", json={
            "date": "2024-01-15",
            "meal_type": "breakfast",
            "name": "Pancakes",
            "ingredients": ["flour", "eggs", "milk"]
        })
        client.post("/api/meals", json={
            "date": "2024-01-16",
            "meal_type": "lunch",
            "name": "Omelette",
            "ingredients": ["eggs", "cheese", "ham"]
        })
        client.post("/api/meals", json={
            "date": "2024-01-17",
            "meal_type": "dinner",
            "name": "Pizza",
            "ingredients": ["flour", "tomato", "cheese"]
        })
        
        # Search for eggs
        response = client.get("/api/meals/search?ingredient=eggs")
        assert response.status_code == 200
        meals = response.json()
        assert len(meals) == 2
        names = [m["name"] for m in meals]
        assert "Pancakes" in names
        assert "Omelette" in names

    def test_search_meals_case_insensitive(self, client):
        """Test that search is case insensitive."""
        client.post("/api/meals", json={
            "date": "2024-01-15",
            "meal_type": "breakfast",
            "name": "Pancakes",
            "ingredients": ["Flour", "EGGS", "Milk"]
        })
        
        # Search with lowercase
        response = client.get("/api/meals/search?ingredient=flour")
        assert response.status_code == 200
        assert len(response.json()) == 1
        
        # Search with uppercase
        response = client.get("/api/meals/search?ingredient=EGGS")
        assert response.status_code == 200
        assert len(response.json()) == 1

    def test_search_meals_returns_latest_first(self, client):
        """Test that search results are ordered by date descending."""
        client.post("/api/meals", json={
            "date": "2024-01-10",
            "meal_type": "breakfast",
            "name": "Old Meal",
            "ingredients": ["cheese"]
        })
        client.post("/api/meals", json={
            "date": "2024-01-20",
            "meal_type": "lunch",
            "name": "New Meal",
            "ingredients": ["cheese"]
        })
        
        response = client.get("/api/meals/search?ingredient=cheese")
        assert response.status_code == 200
        meals = response.json()
        assert len(meals) == 2
        assert meals[0]["name"] == "New Meal"
        assert meals[1]["name"] == "Old Meal"

    def test_search_meals_limit_10(self, client):
        """Test that search returns at most 10 results."""
        for i in range(15):
            client.post("/api/meals", json={
                "date": f"2024-01-{i+1:02d}",
                "meal_type": "breakfast",
                "name": f"Meal {i}",
                "ingredients": ["test"]
            })
        
        response = client.get("/api/meals/search?ingredient=test")
        assert response.status_code == 200
        meals = response.json()
        assert len(meals) == 10

    def test_search_meals_no_results(self, client):
        """Test searching for non-existent ingredient returns empty."""
        client.post("/api/meals", json={
            "date": "2024-01-15",
            "meal_type": "breakfast",
            "name": "Pancakes",
            "ingredients": ["flour"]
        })
        
        response = client.get("/api/meals/search?ingredient=chocolate")
        assert response.status_code == 200
        assert response.json() == []

    def test_search_meals_empty_ingredient_fails(self, client):
        """Test that empty ingredient parameter fails validation."""
        response = client.get("/api/meals/search?ingredient=")
        assert response.status_code == 422

    def test_search_meals_missing_ingredient_fails(self, client):
        """Test that missing ingredient parameter fails."""
        response = client.get("/api/meals/search")
        assert response.status_code == 422

    def test_search_meals_exact_match_only(self, client):
        """Test that search uses exact matching (not partial)."""
        client.post("/api/meals", json={
            "date": "2024-01-15",
            "meal_type": "breakfast",
            "name": "Cheesecake",
            "ingredients": ["cheese", "cream"]
        })
        
        # Should match "cheese"
        response = client.get("/api/meals/search?ingredient=cheese")
        assert response.status_code == 200
        assert len(response.json()) == 1
        
        # Should NOT match partial "chee"
        response = client.get("/api/meals/search?ingredient=chee")
        assert response.status_code == 200
        assert len(response.json()) == 0


class TestSwapMeals:
    """Tests for POST /api/meals/swap endpoint."""

    def test_swap_meals_success(self, client, sample_meals):
        """Test swapping two meals successfully."""
        meal_1 = sample_meals[0]  # breakfast on 2024-01-15 - "Pancakes"
        meal_2 = sample_meals[3]  # breakfast on 2024-01-16 - "Oatmeal"

        # Capture original values before swap (objects will be mutated)
        original_name_1 = meal_1.name
        original_name_2 = meal_2.name
        original_date_1 = str(meal_1.date)
        original_date_2 = str(meal_2.date)

        response = client.post("/api/meals/swap", json={
            "meal_id_1": meal_1.id,
            "meal_id_2": meal_2.id
        })

        assert response.status_code == 200
        data = response.json()
        assert len(data) == 2

        # Check that names and ingredients were swapped
        swapped_1 = next(m for m in data if m["id"] == meal_1.id)
        swapped_2 = next(m for m in data if m["id"] == meal_2.id)

        # Names should be swapped
        assert swapped_1["name"] == original_name_2
        assert swapped_2["name"] == original_name_1

        # Dates and meal_types should remain the same
        assert swapped_1["date"] == original_date_1
        assert swapped_2["date"] == original_date_2

    def test_swap_meals_with_ingredients(self, client):
        """Test swapping meals also swaps ingredients."""
        # Create two meals with different ingredients
        response1 = client.post("/api/meals", json={
            "date": "2024-01-20",
            "meal_type": "breakfast",
            "name": "Pancakes",
            "ingredients": ["flour", "eggs"]
        })
        meal_1_id = response1.json()["id"]

        response2 = client.post("/api/meals", json={
            "date": "2024-01-21",
            "meal_type": "dinner",
            "name": "Steak",
            "ingredients": ["beef"]
        })
        meal_2_id = response2.json()["id"]

        # Swap them
        swap_response = client.post("/api/meals/swap", json={
            "meal_id_1": meal_1_id,
            "meal_id_2": meal_2_id
        })

        assert swap_response.status_code == 200
        data = swap_response.json()

        swapped_1 = next(m for m in data if m["id"] == meal_1_id)
        swapped_2 = next(m for m in data if m["id"] == meal_2_id)

        # First meal slot should now have Steak content
        assert swapped_1["date"] == "2024-01-20"
        assert swapped_1["meal_type"] == "breakfast"
        assert swapped_1["name"] == "Steak"
        assert swapped_1["ingredients"] == ["beef"]

        # Second meal slot should now have Pancakes content
        assert swapped_2["date"] == "2024-01-21"
        assert swapped_2["meal_type"] == "dinner"
        assert swapped_2["name"] == "Pancakes"
        assert swapped_2["ingredients"] == ["flour", "eggs"]

    def test_swap_meals_same_meal_fails(self, client, sample_meal):
        """Test that swapping a meal with itself fails."""
        response = client.post("/api/meals/swap", json={
            "meal_id_1": sample_meal.id,
            "meal_id_2": sample_meal.id
        })

        assert response.status_code == 400
        assert "Cannot swap a meal with itself" in response.json()["detail"]

    def test_swap_meals_first_not_found(self, client, sample_meal):
        """Test that swapping with non-existent first meal returns 404."""
        response = client.post("/api/meals/swap", json={
            "meal_id_1": 99999,
            "meal_id_2": sample_meal.id
        })

        assert response.status_code == 404
        assert "99999" in response.json()["detail"]

    def test_swap_meals_second_not_found(self, client, sample_meal):
        """Test that swapping with non-existent second meal returns 404."""
        response = client.post("/api/meals/swap", json={
            "meal_id_1": sample_meal.id,
            "meal_id_2": 99999
        })

        assert response.status_code == 404
        assert "99999" in response.json()["detail"]


class TestMoveMeal:
    """Tests for PATCH /api/meals/{meal_id}/move endpoint."""

    def test_move_meal_success(self, client, sample_meal):
        """Test moving a meal to an empty slot."""
        response = client.patch(
            f"/api/meals/{sample_meal.id}/move",
            json={"target_date": "2024-01-20", "target_meal_type": "dinner"}
        )

        assert response.status_code == 200
        data = response.json()
        assert data["id"] == sample_meal.id
        assert data["date"] == "2024-01-20"
        assert data["meal_type"] == "dinner"
        assert data["name"] == sample_meal.name

    def test_move_meal_same_date_different_type(self, client, sample_meal):
        """Test moving a meal to a different type on the same day."""
        response = client.patch(
            f"/api/meals/{sample_meal.id}/move",
            json={"target_date": "2024-01-15", "target_meal_type": "dinner"}
        )

        assert response.status_code == 200
        data = response.json()
        assert data["date"] == "2024-01-15"
        assert data["meal_type"] == "dinner"

    def test_move_meal_not_found(self, client):
        """Test moving a non-existent meal returns 404."""
        response = client.patch(
            "/api/meals/99999/move",
            json={"target_date": "2024-01-20", "target_meal_type": "dinner"}
        )

        assert response.status_code == 404
        assert "Meal not found" in response.json()["detail"]

    def test_move_meal_to_occupied_slot_fails(self, client, sample_meals):
        """Test moving a meal to an occupied slot returns 409."""
        meal_to_move = sample_meals[0]  # breakfast on 2024-01-15
        # Try to move to lunch on 2024-01-15 which is occupied
        response = client.patch(
            f"/api/meals/{meal_to_move.id}/move",
            json={"target_date": "2024-01-15", "target_meal_type": "lunch"}
        )

        assert response.status_code == 409
        assert "already exists" in response.json()["detail"]

