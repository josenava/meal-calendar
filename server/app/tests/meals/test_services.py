import pytest
from unittest.mock import Mock

from app.meals.exceptions import MealNotFound, ActionNotAllowed
from app.meals.services import UpdateMealService, DeleteMealService


@pytest.mark.unit
class TestUpdateMealService:
    def test_meal_not_found_raises_exception(self):
        meal_repository = Mock()
        meal_repository.get_by_id.return_value = None

        service = UpdateMealService(meal_repository)
        with pytest.raises(MealNotFound):
            service.execute(Mock(id=1), 1)

    def test_wrong_user_raises_exception(self):
        request_user_id = 1
        meal_repository = Mock()
        meal_repository.get_by_id.return_value = Mock(user_id=5)

        service = UpdateMealService(meal_repository)
        with pytest.raises(ActionNotAllowed):
            service.execute(Mock(id=1), request_user_id)


@pytest.mark.unit
class TestDeleteMealService:
    def test_meal_not_found_raises_exception(self):
        meal_repository = Mock()
        meal_repository.get_by_id.return_value = None

        service = DeleteMealService(meal_repository)
        with pytest.raises(MealNotFound):
            service.execute(1, 1)

    def test_wrong_user_raises_exception(self):
        request_user_id = 1
        meal_repository = Mock()
        meal_repository.get_by_id.return_value = Mock(id=1, user_id=5)

        service = DeleteMealService(meal_repository)
        with pytest.raises(ActionNotAllowed):
            service.execute(1, request_user_id)
