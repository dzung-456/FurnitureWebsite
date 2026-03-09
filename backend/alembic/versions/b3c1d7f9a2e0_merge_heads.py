"""merge heads

Revision ID: b3c1d7f9a2e0
Revises: 6f38f79f66b8, 2a0b4d8c2a19
Create Date: 2026-01-04

"""
from typing import Sequence, Union

from alembic import op


# revision identifiers, used by Alembic.
revision: str = "b3c1d7f9a2e0"
down_revision: Union[str, Sequence[str], None] = ("6f38f79f66b8", "2a0b4d8c2a19")
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # This is a merge revision; no schema changes here.
    pass


def downgrade() -> None:
    """Downgrade schema."""
    # Downgrading a merge revision typically does nothing.
    pass
