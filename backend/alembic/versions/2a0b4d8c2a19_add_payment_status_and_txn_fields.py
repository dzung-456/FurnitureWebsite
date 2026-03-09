"""add payment status and txn fields

Revision ID: 2a0b4d8c2a19
Revises: 1b6673baad74
Create Date: 2026-01-04

"""

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "2a0b4d8c2a19"
down_revision = "1b6673baad74"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "orders",
        sa.Column(
            "payment_status",
            sa.Enum("unpaid", "paid", "failed", name="payment_status"),
            nullable=False,
            server_default="unpaid",
        ),
    )
    op.add_column("orders", sa.Column("paid_at", sa.DateTime(), nullable=True))

    op.add_column("orders", sa.Column("vnpay_response_code", sa.String(length=10), nullable=True))
    op.add_column("orders", sa.Column("vnpay_transaction_no", sa.String(length=50), nullable=True))
    op.add_column("orders", sa.Column("vnpay_bank_tran_no", sa.String(length=50), nullable=True))

    op.add_column("orders", sa.Column("paypal_order_id", sa.String(length=50), nullable=True))
    op.add_column("orders", sa.Column("paypal_capture_id", sa.String(length=50), nullable=True))


def downgrade() -> None:
    op.drop_column("orders", "paypal_capture_id")
    op.drop_column("orders", "paypal_order_id")

    op.drop_column("orders", "vnpay_bank_tran_no")
    op.drop_column("orders", "vnpay_transaction_no")
    op.drop_column("orders", "vnpay_response_code")

    op.drop_column("orders", "paid_at")
    op.drop_column("orders", "payment_status")

    # For MySQL this enum is inline; dropping type is mostly relevant for PostgreSQL.
    try:
        sa.Enum(name="payment_status").drop(op.get_bind(), checkfirst=True)
    except Exception:
        pass
