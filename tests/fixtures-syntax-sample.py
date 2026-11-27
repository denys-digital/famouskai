# ﹥ Famouskai syntax sample: Python (ace/mode/python)
#
# Open this file in Famouskai to check colors, native folding and the Outline.
# Every token family of the Python mode appears at least once.

# • 1. Imports and constants
import os
from pathlib import Path

MAX_LINES = 1_000
RATIO = 3.14e-2
HEX_MASK = 0xFF
DEBUG = False
NOTHING = None


# • 2. A class with a decorator
class Note:
    """A short note, as stored in a Famouskai workspace."""

    def __init__(self, title: str, body: str = "") -> None:
        self.title = title
        self.body = body

    @property
    def is_empty(self) -> bool:
        return len(self.body.strip()) == 0

    @classmethod
    def from_file(cls, path):
        # ﹥ read the whole file, title = first line
        text = Path(path).read_text(encoding="utf-8")
        title, _, body = text.partition("\n")
        return cls(title, body)


# • 3. Functions, strings and control flow
def count_marks(lines, mark="\uFE65"):
    total = 0
    for line in lines:
        if mark in line and not line.startswith("#"):
            total += 1
        elif line == "":
            continue
    return total


def describe(note: Note) -> str:
    # ° TODO: translate the label
    label = 'empty' if note.is_empty else f"{len(note.body)} chars"
    raw = r"C:\notes\{title}"
    return f"{note.title!r}: {label} ({raw})"


async def main():
    try:
        notes = [Note("a"), Note("b", "text")]
        squares = {n: n ** 2 for n in range(5)}
        print(describe(notes[1]), squares, os.sep)
    except (OSError, ValueError) as err:
        raise RuntimeError("cannot read") from err
    finally:
        lambda x: x * 2



# • 4. Nesting: the Outline shows 3 levels, the 4th is left out
def retry(times=3):
    def decorator(func):
        def wrapper(*args, **kwargs):
            def attempt():
                return func(*args, **kwargs)
            for _ in range(times):
                try:
                    return attempt()
                except OSError:
                    continue
        return wrapper
    return decorator

if __name__ == "__main__":
    import asyncio
    asyncio.run(main())
