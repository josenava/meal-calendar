.PHONY: lock-requirements up down cmd tests

lock-requirements:
	pip-compile requirements.in > requirements.txt && pip-compile requirements-dev.in > requirements-dev.txt

up:
	docker-compose up

down:
	docker-compose down

cmd:
	docker-compose run --rm backend $(cmd)

tests:
	docker-compose run --rm backend pytest
