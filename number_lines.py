from __future__ import annotations

from pathlib import Path


def number_lines_in_file(source_path: Path, destination_path: Path) -> None:
    """Read a text file, prefix each line with a number, and write to output."""
    lines = source_path.read_text(encoding="utf-8").splitlines()
    numbered = [f"{index + 1}: {line}" for index, line in enumerate(lines)]
    destination_path.write_text("\n".join(numbered) + ("\n" if numbered else ""), encoding="utf-8")


def main() -> None:
    base_dir = Path(__file__).parent
    input_dir = base_dir / "input"
    output_dir = base_dir / "output"

    output_dir.mkdir(exist_ok=True)

    if not input_dir.exists():
        print(f"Input folder not found: {input_dir}")
        print("Create an 'input' folder and put .txt files inside it.")
        return

    txt_files = sorted(input_dir.glob("*.txt"))
    if not txt_files:
        print(f"No .txt files found in: {input_dir}")
        return

    for txt_file in txt_files:
        destination = output_dir / txt_file.name
        number_lines_in_file(txt_file, destination)
        print(f"Wrote: {destination}")


if __name__ == "__main__":
    main()
