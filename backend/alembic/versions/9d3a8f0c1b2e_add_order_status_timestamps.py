"""add order status timestamps

Revision ID: 9d3a8f0c1b2e
Revises: b3c1d7f9a2e0
Create Date: 2026-01-06

"""

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "9d3a8f0c1b2e"
down_revision = "b3c1d7f9a2e0"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("orders", sa.Column("processing_at", sa.DateTime(), nullable=True))
    op.add_column("orders", sa.Column("shipped_at", sa.DateTime(), nullable=True))
    op.add_column("orders", sa.Column("delivered_at", sa.DateTime(), nullable=True))
    op.add_column("orders", sa.Column("cancelled_at", sa.DateTime(), nullable=True))


def downgrade() -> None:
    op.drop_column("orders", "cancelled_at")
    op.drop_column("orders", "delivered_at")
    op.drop_column("orders", "shipped_at")
    op.drop_column("orders", "processing_at")
