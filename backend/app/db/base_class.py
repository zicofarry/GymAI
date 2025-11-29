from typing import Any
from sqlalchemy.ext.declarative import as_declarative, declared_attr

@as_declarative()
class Base:
    id: Any
    __name__: str

    # Otomatis generate nama tabel dari nama class (opsional, tapi praktis)
    # Misal class User -> tabel "user" (atau kamu bisa override manual nanti)
    @declared_attr
    def __tablename__(cls) -> str:
        return cls.__name__.lower()
