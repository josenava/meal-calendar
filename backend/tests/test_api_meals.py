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


class TestUpdateMeal:
    """Tests for PUT /api/meals/{meal_id} endpoint."""

    def test_update_meal_success(self, client, sample_meal):
        """Test updating an existing meal."""
        response = client.put(
            f"/api/meals/{sample_meal.id}",
            json={"name": "Updated Pancakes"}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == sample_meal.id
        assert data["name"] == "Updated Pancakes"
        assert data["date"] == str(sample_meal.date)
        assert data["meal_type"] == sample_meal.meal_type

    def test_update_meal_not_found(self, client):
        """Test updating a non-existent meal returns 404."""
        response = client.put("/api/meals/99999", json={"name": "New name"})
        assert response.status_code == 404
        assert response.json()["detail"] == "Meal not found"

    def test_update_meal_empty_name_fails(self, client, sample_meal):
        """Test that updating with empty name fails."""
        response = client.put(
            f"/api/meals/{sample_meal.id}",
            json={"name": ""}
        )
        assert response.status_code == 422

    def test_update_meal_strips_whitespace(self, client, sample_meal):
        """Test that updated meal name whitespace is stripped."""
        response = client.put(
            f"/api/meals/{sample_meal.id}",
            json={"name": "  Waffles  "}
        )
        assert response.status_code == 200
        assert response.json()["name"] == "Waffles"


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
