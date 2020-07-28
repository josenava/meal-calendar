"""Add meals

Revision ID: dd2bc8862ea5
Revises: 1ad55ffdeb02
Create Date: 2020-07-27 14:31:14.588029

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = 'dd2bc8862ea5'
down_revision = '1ad55ffdeb02'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table('meals',
    sa.Column('id', postgresql.UUID(), nullable=False),
    sa.Column('title', sa.String(), nullable=False),
    sa.Column('type', sa.Enum('BREAKFAST', 'LUNCH', 'DINNER', name='mealtype'), nullable=False),
    sa.Column('date', sa.Date(), nullable=False),
    sa.Column('user_id', sa.Integer(), nullable=True),
    sa.Column('created_at', sa.DateTime(), nullable=True),
    sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_table('meals')
    # ### end Alembic commands ###