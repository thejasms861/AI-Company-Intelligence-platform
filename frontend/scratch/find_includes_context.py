import re

with open("campus-compass-main/campus-compass-main/dist/assets/index-DyaFLLsC.js", "r", encoding="utf-8") as f:
    content = f.read()

# Find all occurrences of '.includes(' and print 100 characters before and after
for match in re.finditer(r'\.includes\(', content):
    start = max(0, match.start() - 100)
    end = min(len(content), match.end() + 100)
    print(f"Match at {match.start()}:\n{content[start:end]}\n{'-'*50}")
