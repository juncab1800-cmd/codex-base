# Line Numbering Sample (Windows 10 / Python)

## What this does
- Reads all `.txt` files in the `input` folder.
- Adds line numbers to the start of each line.
- Writes the results into the `output` folder (same file names).

## Required library
- Python 3.8+ (standard library only; no extra packages required)

## How to run (beginner-friendly)
1. **Install Python**
   - Download and install from: https://www.python.org/downloads/windows/
   - During installation, **check** "Add Python to PATH".

2. **Prepare folders**
   - In this project folder, create a folder named `input`.
   - Put your `.txt` files inside `input`.

3. **Run the script**
   - Open "Command Prompt".
   - Move to the project folder:
     ```
     cd /d C:\path\to\codex-base
     ```
   - Run:
     ```
     python number_lines.py
     ```

4. **Check results**
   - The numbered files will be in the `output` folder.

## Example
If `input/sample.txt` contains:
```
Apple
Banana
Cherry
```

Then `output/sample.txt` will be:
```
1: Apple
2: Banana
3: Cherry
```
