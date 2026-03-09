import datetime
from sqlalchemy import Column, Integer, DateTime
from sqlalchemy.orm import declared_attr
from sqlalchemy.orm import as_declarative

@as_declarative()
class Base:
    __abstract__ = True
    __name__: str
    # Allow legacy style annotations like: id: int = Column(...)
    # without requiring SQLAlchemy 2.0 Mapped[] typing everywhere.
    __allow_unmapped__ = True

    @declared_attr
    def __tablename__(cls) -> str:
        return cls.__name__.lower()

class BaseModel(Base):
    __abstract__ = True
    __allow_unmapped__ = True

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
