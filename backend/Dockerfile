FROM python:3.14-slim

WORKDIR /app

# Python optimization for containers
ENV PYTHONUNBUFFERED=1

# Install uv
COPY --from=ghcr.io/astral-sh/uv:latest /uv /bin/uv

# Copy dependency files
COPY pyproject.toml uv.lock ./

# Install production dependencies from lockfile and compile bytecode
RUN uv sync --frozen --no-dev --no-install-project --compile-bytecode

# Copy application code
COPY app/ ./app/

# Compile application bytecode
RUN .venv/bin/python -m compileall -q app/

# Create data directory for SQLite
RUN mkdir -p data

# Expose port
EXPOSE 8000

# Run the application from venv
CMD [".venv/bin/uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
