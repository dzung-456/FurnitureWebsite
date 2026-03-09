from app.models.base_model import BaseModel
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Float
from sqlalchemy.orm import relationship
from sqlalchemy import DDL, event
from datetime import datetime

class Review(BaseModel):
    __tablename__ = "reviews"
    __allow_unmapped__ = True
    
    # review_id: int = Column(Integer, primary_key=True, index=True)
    rating = Column(Integer, index=True)
    comment = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.now)
    
    user_id = Column(Integer, ForeignKey("users.id"))
    product_id = Column(Integer, ForeignKey("products.id"))

    user = relationship("User", back_populates="reviews")
    product = relationship("Product", back_populates="reviews")

    @property
    def username(self):
        return getattr(self.user, "username", None)


# Keep products.average_rating synced with reviews via DB triggers.
# This is attached to table creation so it works with Base.metadata.create_all().
_SQLITE_TRIGGERS = [
        DDL(
                """
                CREATE TRIGGER IF NOT EXISTS reviews_ai_update_product_average
                AFTER INSERT ON reviews
                BEGIN
                    UPDATE products
                    SET average_rating = COALESCE((SELECT AVG(rating) FROM reviews WHERE product_id = NEW.product_id), 0)
                    WHERE id = NEW.product_id;
                END;
                """
        ),
        DDL(
                """
                CREATE TRIGGER IF NOT EXISTS reviews_au_update_product_average
                AFTER UPDATE OF rating, product_id ON reviews
                BEGIN
                    UPDATE products
                    SET average_rating = COALESCE((SELECT AVG(rating) FROM reviews WHERE product_id = OLD.product_id), 0)
                    WHERE id = OLD.product_id;
                    UPDATE products
                    SET average_rating = COALESCE((SELECT AVG(rating) FROM reviews WHERE product_id = NEW.product_id), 0)
                    WHERE id = NEW.product_id;
                END;
                """
        ),
        DDL(
                """
                CREATE TRIGGER IF NOT EXISTS reviews_ad_update_product_average
                AFTER DELETE ON reviews
                BEGIN
                    UPDATE products
                    SET average_rating = COALESCE((SELECT AVG(rating) FROM reviews WHERE product_id = OLD.product_id), 0)
                    WHERE id = OLD.product_id;
                END;
                """
        ),
]

for _ddl in _SQLITE_TRIGGERS:
        event.listen(Review.__table__, "after_create", _ddl.execute_if(dialect="sqlite"))
