from __future__ import annotations
from dataclasses import dataclass
from pathlib import Path
import os

@dataclass(frozen=True)
class LeoConfig:
    name: str = "L.E.O."
    version: str = "1.1.0"
    owner_controlled: bool = True
    privacy_first: bool = True
    workspace: Path = Path(os.environ.get("LEO_WORKSPACE", r"D:\LEO"))
    backup_root: Path = Path(os.environ.get("LEO_BACKUP_ROOT", r"E:\LEO-Backups"))
    approval_ttl_seconds: int = 300

CONFIG = LeoConfig()
